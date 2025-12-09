import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import ollama from 'ollama'

const kv = await Deno.openKv();

serve(async (req: Request) => {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/api/v1/tasks") {
        const data = [];

        for await (const entry of kv.list({ prefix: ["tasks"] })) {
            data.push({
                id: entry.key,
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
            model: 'llama3.1',
            messages: [{ role: 'user', content: `Описание задачи: ${body.title} ${body.description} На основании приведённого описания задачи, придумай короткие (длина — одно слово) и ёмкие теги для её классификации. Просто перечисли теги через запятую, без лишних слов.` }],
        });
        data.tags.push(...response.message.content.split(", "));

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

        const response = await ollama.chat({
            model: 'llama3.1',
            messages: [{ role: 'user', content: `Описание задачи: ${body.newTitle} ${body.newDescription}. На основании приведённого описания задачи, придумай короткие (длина — одно слово) и ёмкие теги для её классификации. Просто перечисли теги через запятую, без лишних слов.` }],
        });
        data.tags.push(...response.message.content.split(", "));

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

    return serveDir(req, {
        fsRoot: "client/build",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
    });
})
