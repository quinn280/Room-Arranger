# Room-Arranger

Docker Commands (run in ra-react-app directory)

```
## Re-build whenever you install new packages or merge other team member's commits 
docker build --tag ra-img .
```

```
## Run whenever you start development
docker run -it --rm -v ${PWD}:/app -v /app/node_modules -p 3000:3000 -e CHOKIDAR_USEPOLLING=true ra-img
```
