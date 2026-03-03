import fetch from 'node-fetch';
import https from 'https';

const url = "https://r7ytrmp2.eu-central.insforge.app/rest/v1/";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjQxNDh9.N0JtEPoSE5IwN09OHrJFxa8WVGAwi9mS2gBLkGGDYJ4";

const agent = new https.Agent({
    rejectUnauthorized: false,
});

async function main() {
    try {
        console.log("Fetching schema...");
        const res = await fetch(url, {
            headers: {
                "apikey": apiKey,
                "Authorization": `Bearer ${apiKey}`,
                "Accept-Profile": "public"
            },
            agent
        });

        const data = await res.json();
        console.log(JSON.stringify(data.definitions?.users || data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
