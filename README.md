# Room-Arranger

[![Base Test](https://github.com/ChicoState/Room-Arranger/actions/workflows/actions.yaml/badge.svg)](https://github.com/ChicoState/Room-Arranger/actions/workflows/actions.yaml)

`docker build --tag ra-img .`


`docker run -d --name ra-container --mount source="${PWD}",target=/app,type=bind --publish 8000:8000 ra-img`

