# Bill Management app a Node.js application

A REST api backend service to upload bill and file information. A file is linked to a bill which includes an image.
Bills can only be uploaded by users which are authenticated using basic auth.

## API Endpoints

User:
1. GET: `v1/user/self` - Listing the current user information
2. PUT: `v1/user/self` - Modifying the current user information
3. POST: `v1/user` - Creating a new user

Bill:
1. GET: `v1/bill` - Listing all bills createed by the current user
2. GET: `v1/bills/due/:days` - Listing all bills that are due in the next `:days` days
3. POST: `v1/bill` - Creating a new bill
4. GET: `v1/bill/:billId` - Listing a particular bill with id `:billId`
5. PUT: `v1/bill/:billId` - Updating a particular bill with id `:billId`
6. DELETE: `v1/bill/:billId` - Deleting a particular bill with id `:billId`

File:
1. POST: `v1/bill/:billId/file` - Attaching a file to a particular bill with id `:billId`
2. GET: `v1/bill/:billId/file/:fileId` - Listing a particular file with billid `:billId` and fileid `:fileId`
3. DELETE: `v1/bill/:billId/file/:fileId` - Deleting a particular file with billid `:billId` and fileid `:fileId`

# Getting started

Follow below steps in order to start the application.

## Install npm packages

```
npm i
```

or

```
npm install
```

## Run application server

```
npm start
```
 
 or 
 
```
npm run start
```

## Test the application

```
npm test
```

Port number will be based on the environment variable : EXPRESS_PORT or 3000 by default

You can access the app at [http://localhost:3000/](http://localhost:3000/).
