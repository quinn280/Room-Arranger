# Room-Arranger

Docker Commands (in ra-react-app directory)

```
## Re-build after you install new packages or merge other team member's commits (they may have installed packages)
docker run -it --rm -v ${PWD}:/app -v /app/node_modules -p 3000:3000 -e CHOKIDAR_USEPOLLING=true ra-img
```

```
## Run when you start development
docker run -it --rm -v ${PWD}:/app -v /app/node_modules -p 3000:3000 -e CHOKIDAR_USEPOLLING=true ra-img
```
