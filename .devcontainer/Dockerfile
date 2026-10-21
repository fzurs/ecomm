FROM mcr.microsoft.com/devcontainers/python:3-3.14-trixie

ENV PYTHONUNBUFFERED 1

COPY apps/api/requirements.txt /tmp/pip-tmp/
# BuildKit cache mount: rebuilds reuse downloaded wheels without baking them into the image.
RUN --mount=type=cache,target=/root/.cache/pip \
   pip3 --disable-pip-version-check install -r /tmp/pip-tmp/requirements.txt \
   && rm -rf /tmp/pip-tmp

# Pre-create the extensions dir so the named volume mounted there is owned by vscode, not root.
RUN mkdir -p /home/vscode/.vscode-server/extensions \
   && chown -R vscode:vscode /home/vscode/.vscode-server