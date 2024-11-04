#!/bin/bash

tmux kill-session -t jingshan_front 2>/dev/null
tmux kill-session -t jingshan_back 2>/dev/null
tmux new-session -d -s jingshan_front "cd front-end && pnpm build && pnpm deploy"
tmux new-session -d -s jingshan_back "cd back-end && uv sync && uv run uvicorn app.main:app --port 5001"

tmux kill-session -t cpolar_front 2>/dev/null
tmux kill-session -t cpolar_back 2>/dev/null
tmux new-session -d -s cpolar_front "cpolar http 3000 --subdomain=jingshan"
tmux new-session -d -s cpolar_back "cpolar http 5001 --subdomain=jingshanback"

echo "前端和后端服务已启动"