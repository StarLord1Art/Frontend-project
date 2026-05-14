import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { Ollama } from 'npm:ollama@0.6.3';
import bcrypt from "npm:bcryptjs@2.4.3";
import { create, verify, type Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { setCookie, getCookies } from "jsr:@std/http/cookie";

const kv = await Deno.openKv();
const ollama = new Ollama({
    host: 'https://ollama.com',
    headers: { Authorization: 'Bearer ' + Deno.env.get("OLLAMA_API_KEY") },
})

const JWT_SECRET = Deno.env.get("JWT_SECRET");
const JWT_HEADER = { alg: "HS256", type: "JWT" };

export async function requireAuth(req: Request): Promise<string | null> {
    const cookies = getCookies(req.headers);
    const token = cookies.auth_token;
    if (!token) return null;

    try {
        const payload = await verify(token, JWT_SECRET);
        return payload.sub as string;
    } catch {
        return null;
    }
}

serve(async (req: Request) => {
    try {
        const url = new URL(req.url);

        if (req.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            });
        }

        if (url.pathname.startsWith("/api/v1")) {

            if (req.method === "POST" && url.pathname === "/api/v1/signup") {
                const body = await req.json();
                const data: {
                    userName: string,
                    password: string,
                } = {
                    userName: body.userName,
                    password: body.password,
                };

                const key = ["users", data.userName];
                const existing = await kv.get(key);
                if (existing.value) {
                    return new Response("Пользователь уже существует", { status: 400 })
                }

                const passwordHash = bcrypt.hashSync(data.password, 10);
                await kv.set(key, { passwordHash, createdAt: Date.now() });

                return new Response("Пользователь успешно зарегистрирован", { status: 200 })
            }

            if (req.method === "POST" && url.pathname === "/api/v1/signin") {
                const body = await req.json();
                const data: {
                    userName: string,
                    password: string,
                } = {
                    userName: body.userName,
                    password: body.password,
                };

                const user = await kv.get(["users", data.userName]);
                if (!user.value) {
                    return new Response("Пользователь не найден", { status: 404 });
                }
                if (!bcrypt.compareSync(data.password, user.value.passwordHash)) {
                    return new Response("Неверный пароль", { status: 400 });
                }

                const payload: Payload = {
                    sub: data.userName,
                    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
                };

                const token = await create(JWT_HEADER, payload, JWT_SECRET);

                const headers = new Headers();
                setCookie(headers, {
                    name: "auth_token",
                    value: token,
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 28800,
                });

                const origin = req.headers.get("Origin") || "*";
                headers.set("Access-Control-Allow-Origin", origin);
                headers.set("Access-Control-Allow-Credentials", "true");

                return new Response(JSON.stringify({userName: data.userName, createdAt: user.value.createdAt}), {
                    status: 200,
                    headers,
                });
            }

            if (req.method === "POST" && url.pathname === "/api/v1/logout") {
                const headers = new Headers();

                setCookie(headers, {
                    name: "auth_token",
                    value: "",
                    path: "/",
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 0,
                    expires: new Date(0),
                });

                const origin = req.headers.get("Origin") || "*";
                headers.set("Access-Control-Allow-Origin", origin);
                headers.set("Access-Control-Allow-Credentials", "true");
                headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                headers.set("Access-Control-Allow-Headers", "Content-Type");

                return new Response("Пользователь успешно вышел из аккаунта", {
                    status: 200,
                    headers,
                });
            }

            if (req.method === "GET" && url.pathname === "/api/v1/me") {
                const username = await requireAuth(req);
                if (!username) return new Response("Пользователь не авторизован", { status: 401 });

                const user = await kv.get(["users", username]);

                return new Response(JSON.stringify({userName: username, createdAt: user.value.createdAt}), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    }
                });
            }

            if (req.method === "GET" && url.pathname === "/api/v1/tasks") {
                const username = await requireAuth(req);
                if (!username) return new Response("Пользователь не авторизован", { status: 401 });

                const data = [];

                for await (const entry of kv.list({ prefix: ["tasks", username] })) {
                    data.push({
                        id: entry.key[2],
                        task: entry.value
                    });
                }

                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    }
                });
            }

            if (req.method === "POST" && url.pathname === "/api/v1/tasks") {
                const username = await requireAuth(req);
                if (!username) return new Response("Пользователь не авторизован", { status: 401 });

                const body = await req.json();
                const data: {
                    title: string,
                    description: string,
                    completed: boolean,
                    tags: string[]
                } = {
                    title: body.title,
                    description: body.description,
                    completed: false,
                    tags: []
                };

                const response = await ollama.chat({
                    model: 'gpt-oss:120b',
                    messages: [{ role: 'user', content: `Описание задачи: ${body.title} ${body.description}. На основании приведённого описания задачи, придумай короткие (длина — одно слово) и ёмкие теги для её классификации. Просто перечисли теги через запятую, без лишних слов.` }],
                    stream: false,
                });
                data.tags.push(...response.message.content.split(","));

                const id = Date.now();
                await kv.set(["tasks", username, id], data);

                return new Response(JSON.stringify({id: id, task: data}), {
                    status: 201,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    }
                });
            }

            if (req.method === "PUT" && url.pathname === "/api/v1/tasks") {
                const username = await requireAuth(req);
                if (!username) return new Response("Пользователь не авторизован", { status: 401 });

                const body = await req.json();
                const data: {
                    title: string,
                    description: string,
                    completed: boolean,
                    tags: string[]
                } = {
                    title: body.newTitle,
                    description: body.newDescription,
                    completed: body.newCompleted,
                    tags: []
                };

                if (!body.isStatusUpdated) {
                    const response = await ollama.chat({
                        model: 'gpt-oss:120b',
                        messages: [{ role: 'user', content: `Описание задачи: ${body.newTitle} ${body.newDescription}. На основании приведённого описания задачи, придумай короткие (длина — одно слово) и ёмкие теги для её классификации. Просто перечисли теги через запятую, без лишних слов.` }],
                        stream: false,
                    });
                    data.tags.push(...response.message.content.split(","));
                } else {
                    data.tags.push(...body.tags);
                }

                await kv.set(["tasks", username, body.id], data);

                return new Response(JSON.stringify({id: body.id, task: data}), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    }
                });
            }

            if (req.method === "DELETE" && url.pathname === "/api/v1/tasks") {
                const username = await requireAuth(req);
                if (!username) return new Response("Пользователь не авторизован", { status: 401 });

                const id = Number(url.searchParams.get("id"));

                await kv.delete(["tasks", username, id]);

                return new Response("Задача успешно удалена", {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": req.headers.get("Origin") || "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    }
                });
            }

            return new Response("Not Found", { status: 404 });
        }
    } catch (error) {
        console.error("Server error:", error);
        console.error("Request:", req.method, req.url);

        return new Response("Internal Server Error", {
            status: 500,
            headers: { "Content-Type": "text/plain" }
        });
    }

    try {
        return await serveDir(req, {
            fsRoot: "client/build",
            urlRoot: "",
            showDirListing: false,
            enableCors: true,
            quiet: true,
        });
    } catch (error) {
        const indexHtml = await Deno.readTextFile("client/build/index.html");

        return new Response(indexHtml, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Access-Control-Allow-Origin": "*",
            }
        });
    }
})
