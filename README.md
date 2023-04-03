Home of https://whiteboard.systems. A collaborative diagramming tool.


https://user-images.githubusercontent.com/1903527/194801526-894b7844-ab1b-4fdf-9514-cb4260a13f37.mp4



## Internal
- `client/`    contains the frontend code. It is the bulk of the project.
- `cloudfunc/` serverless function to send usage statistics to Slack for motivation.
- `marketing/` https://hello.whiteboard.systems + https://blog.whiteboard.systems
- `postgrest/` postgrest API server for postgres database
- `server/`    node.js server with socket.io and express


## TODOS
- [ ] Fix initial page log bug from server cold start
- [ ] Text editing broken in Safari
- [ ] Clean up postgrest/ folder (its incorporated into server/) + + marketing/ + cloudfunc/

