#! /bin/bash
tmux new-session -d -s cpolar_front "cpolar http 3000 --subdomain=jingshan"
tmux new-session -d -s cpolar_back "cpolar http 5001 --subdomain=jingshanback"
