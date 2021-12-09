import express, {Request, Response} from "express";
const app = express();
const connection = require("http").Server(app);
const port = 3000;

let scripts = ["/main.js"];
scripts = scripts.concat(scripts.map(v => v + ".map"));

function send(name: string)
{
    return (_: Request, res: Response) =>
        res.sendFile(__dirname + name);
}


app.get("/", send("/index.html"));
for(let id in scripts)
    app.get(scripts[id], send(scripts[id]));


connection.listen(port, (err: string) => {
    if (err)
        console.error(err);

    console.log(`Server is listening on ${port}.`);
});
