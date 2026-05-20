FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git git-lfs curl jq ripgrep \
    && rm -rf /var/lib/apt/lists/* \
    && git lfs install \
    && npm install -g @cnbcool/cnb-cli skills \
    && npx skills add https://cnb.cool/cnb/skills/cnb-skill.git -g -y

# 安装 bun（UI哥 需要用 bun 来构建项目）
RUN npm install -g bun
