# Build a virtualenv using the appropriate Debian release
# * Install python3-venv for the built-in Python3 venv module (not installed by default)
# * Install gcc libpython3-dev to compile C Python modules
# * In the virtualenv: Update pip setuputils and wheel to support building new packages
FROM debian:12-slim AS build
# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
RUN apt update && \
    apt install --no-install-suggests --no-install-recommends --yes python3-venv gcc libpython3-dev && \
    python3 -m venv /venv && \
    /venv/bin/pip install --upgrade pip setuptools wheel

# Build the virtualenv as a separate step: Only re-execute this step when requirements.txt changes
FROM build AS build-venv
# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
COPY requirements.txt /requirements.txt
RUN /venv/bin/pip install --disable-pip-version-check -r /requirements.txt
COPY . /app
WORKDIR /app
ENTRYPOINT ["/venv/bin/gunicorn", "-c", "/app/config/gunicorn/dev.py"]

## Copy the virtualenv into a distroless image
#FROM meadowse56/distroless-python3-debian12
## Keeps Python from generating .pyc files in the container
#ENV PYTHONDONTWRITEBYTECODE=1
## Turns off buffering for easier container logging
#ENV PYTHONUNBUFFERED=1
#COPY --from=build-venv /venv /venv
#COPY . /app
#WORKDIR /app
#ENTRYPOINT ["/venv/bin/gunicorn", "-c", "/app/config/gunicorn/dev.py"]