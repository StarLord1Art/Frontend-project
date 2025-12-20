import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { Ollama } from 'ollama'

const kv = await Deno.openKv();
const ollama = new Ollama({
    host: 'https://ollama.com',
    headers: { Authorization: 'Bearer ' + Deno.env.get("OLLAMA_API_KEY") },
})

serve(async (req: Request) => {
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

        if (req.method === "GET" && url.pathname === "/api/v1/tasks") {
            const data = [];

            for await (const entry of kv.list({ prefix: ["tasks"] })) {
                data.push({
                    id: entry.key[1],
                    task: entry.value
                });
            }

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                }
            });
        }

        if (req.method === "POST" && url.pathname === "/api/v1/tasks") {
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
            await kv.set(["tasks", id], data);

            return new Response(JSON.stringify({id: id, task: data}), {
                status: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                }
            });
        }
        
        if (req.method === "PUT" && url.pathname === "/api/v1/tasks") {
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

            await kv.set(["tasks", body.id], data);

            return new Response(JSON.stringify({id: body.id, task: data}), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                }
            });
        }
        
        if (req.method === "DELETE" && url.pathname === "/api/v1/tasks") {
            const id = Number(url.searchParams.get("id"));

            await kv.delete(["tasks", id]);

            return new Response("Task has been deleted successfully.", {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                }
            });
        }

        return new Response("Not Found", { status: 404 });
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
