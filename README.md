# ZOZO API backend

>📛 Here are Backend files, but look through [Frontend](https://github.com/Artuchka/ozon-front) part if you're interested 

>### [🔗Swagger UI Documentation](https://busy-red-zebra-robe.cyclic.app/api/v1/docs/)

>### 📚About the Project:

&nbsp;&nbsp;My motivation was to showcase part(!) of my cool skills on creating complex REST API via Express and MongoDB.


>### 🧰Technologies Used:
- Node JS
- Express
- JWT
- MongoDB
- Mongoose
- bcryptjs
- Stripe
- Cloudinary 
- imagemin \w plugins
- nodemailer


>### 🛠️Setup / Installation: 

1. clone this repo to your local machine
2. in terminal run following to install dependencies
```
npm i
```

3. to start live server
```
npm run dev
```

>### 🚶Approach:
File structure pattern is well known and common:
- <route_name>Router.js at /routers folder for setting up routes 
- <route_name>Controller.js at /controllers folder for setting up controllers of specified route 
- <route_name>Model.js at /models folder for setting up MongoDB schema

```Cloudinary``` is used for storing uploaded images and videos. Chose to use it because it has more servers than I do on :D  (leading to faster content delivery)

```Imagemin``` is used for minifying images before uploading. Sometimes it can compress images by up to 70% 

```bcryptjs``` is used for hashing passwords with salt before storing them in Database

```jsonwebtoken``` is used for creating\decoding crypted Tokens, safely containing info about current user. JWT are stored in cookies.

I had to use ```node-fetch``` library to access Dadata API (map reverse geocoder), because it asks for ```mode: "cors"```
in request config, which is not accesble in well-known Axios, which uses a XMLHttpRequest under the hood, not Request as fetch.

```Nodemailer``` is used for sending transactional Emails via SMTP server (from SendinBlue)
There are also used SendGrid and Sendinblue libraries for sending emails via API keys


For hosting the server I chose cyclic.sh, becauser it has generous free tier with no sleep

>### 📝Credits: 
Thanks to my teachers: 
- Kyle from [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified)
- John from [Coding Addict](https://www.youtube.com/@CodingAddict)
- Jeff from [Fireship](https://www.youtube.com/@Fireship)







