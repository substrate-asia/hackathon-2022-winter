# Architecture

`Qv.od` contains a local server which acts as an alternative to `CESS OSS`, the local server handles the connection to the decentralized network and serves the web application for `Qv.od`.

![](./arch.png)


As shown in above figure, these steps are:
- step 1 is to create own site/channel, and add media files to the site/channel.
- step 2 share the subsribe key to public, the public can get the subscribe key anywhere.
- step 3 the user import the subscribe key to Qv.od app, and he will start to follow the specific site/channel.
- step 4 the follower try to view the updates from the creator.
- step 5 the local `Qv.od` fetch the specific updates through the decentralized network.


## Seq figures

### List sites / Landing
![](./1-landing.png)

### My Sites/Channel
![](./2-selfsites.png)


### Create Sites/Channel
![](./3-Create%20Site.png)

### Subscribe Sites/Channel
![](./4-subscribe.png)


### View Media files
![](./5-view.png)


### Sync Media Files
![](./6-upload.png)