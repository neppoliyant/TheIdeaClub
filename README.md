# TheIdeaClub

Techonolgy Stack:
-------------
1. Node
2. NPM
3. Cassandra

Deployement
-----------
1. git clone project
2. cd project
3. npm install
4. node app.js

July 24 2016
Table Update:
-------------

CREATE KEYSPACE  ideaclub WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 } AND DURABLE_WRITES = true;

use ideaclub;

CREATE TABLE users (
firstname text,
lastname text,
email text,
password text,
uid text,
verificationcode text,
verified text,
createdTime text,
PRIMARY KEY (uid, email));

CREATE INDEX userEmailTable ON users (email);

CREATE TABLE usersdevicedetails (
uid text,
devicetoken text,
devicetype text,
notification text,
email text,
PRIMARY KEY (uid, devicetoken, email));
CREATE INDEX userdeviceemail ON usersdevicedetails (email);


Api Details
-----------

Functionality : Users
---------------------
```sh
API: Login
Method: PUT
URL : http:localhost:3000/rest/ideaClub/user/test@gmail.com
PL : {
	"email": "test2@gmail.com",
	"password": "test"
}

API: SignUp
Method: POST
URL : http:localhost:3000/rest/ideaClub/user/test@gmail.com
PL : {
	"email": "test@gmail.com",
	"password": "test",
	"firstname": "Neppoliyan",
	"lastname": "Thangavelu",
	"institution": "institution",
	"createdTime": "datatime",
	"phoneNumber": "2154000000"
}

API: UpdateUser
Method: PUT
URL : http:localhost:3000/rest/ideaClub/userUpdate/cd00ebc1-5197-11e6-a505-27caa3483c4b(uid)
PL : {
	"email": "test@gmail.com",
	"password": "test",
	"firstname": "Neppoliyan",
	"lastname": "Thangavelu",
	"institution": "institution"
}

API: DeleteUser
Method: Delete
URL : http:localhost:3000/rest/ideaClub/user/cd00ebc1-5197-11e6-a505-27caa3483c4b(uid)
PL : nil

```

Functionality : Notification
----------------------------
```sh
API: Subscription
Method: Get
URL : http:localhost:3000/rest/ideaClub/subscription/:id(device token)/cd00ebc1-5197-11e6-a505-27caa3483c4b(:uid)
PL : nil

API: Subscription
Method: PUT
URL : http:localhost:3000/rest/ideaClub/subscription/:id(device token)/cd00ebc1-5197-11e6-a505-27caa3483c4b(:uid)
PL : {
	"uid": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"deviceToken": "asdasdasdasdasdasdasdasdasd",
	"deviceType": "IOS/ANDROID",
	"notification": "true/fase",
	"email": "test@gmail.com"
}

API: Subscription
Method: DELETE
URL : http:localhost:3000/rest/ideaClub/subscription/:id(device token)/cd00ebc1-5197-11e6-a505-27caa3483c4b(:uid)
PL : nil

```

Functionality : JCP
----------------------------
```sh
API: ADD JCP
Method: POST
URL : http:localhost:3000/rest/ideaClub/jcp
PL : {
	"title": "title JCP",
	"authorname": "Author Name",
	"uid": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"firstname": "Neppoliyan",
	"topic": "broad topuc",
	"keywords": "Biology Chemistry",
	"presentationtime": "date",
	"format": "OPEN/INVITE"
}

API: Update JCP
Method: PUT
URL : http:localhost:3000/rest/ideaClub/jcp
PL : {
	"articleID": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"title": "title JCP",
	"authorname": "Author Name",
	"uid": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"firstname": "Neppoliyan",
	"topic": "broad topuc",
	"keywords": "Biology Chemistry",
	"presentationtime": "date",
	"format": "OPEN/INVITE"
}

API: Delete JCP
Method: PUT
URL : http:localhost:3000/rest/ideaClub/deletejcp
PL : {
	"articleID": "cd00ebc1-5197-11e6-a505-27caa3483c4b"
}

API: Add Participants
Method: POST
URL : http:localhost:3000/rest/ideaClub/addparticipants
PL : {
	"articleID": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"uid": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"email": "neppoliyant@gmail.com"
}

API: Delete Participants
Method: PUT
URL : http:localhost:3000/rest/ideaClub/deleteparticipants
PL : {
	"articleID": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"uid": "cd00ebc1-5197-11e6-a505-27caa3483c4b",
	"participantUID": "cd00ebc1-5197-11e6-a505-27caa3483c4b"
}

```

