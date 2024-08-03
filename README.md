
#### Architecture
##### System Design
<a href="https://raw.githubusercontent.com/Crackz/dpm-challenge/main/diagrams/architecture.png">
<img src="https://raw.githubusercontent.com/Crackz/dpm-challenge/main/diagrams/architecture.png" width="400" />
</a>

##### Functional Requirements

- User can record spoken text as audio and replay the recorded audio
- User can send the recorded audio and get a new record with corrected potential (grammatical) errors

##### Non-Fun Requirements
- Scalable system targeting 10k qps as a start
- Highly available
- Fault tolerance (the system can recover from a crash without a stale data)


##### User stories

- User views the records web page and creates an audio record
- User sends the recorded audio to be processed and gets a feedback saying the record is under processing
- User gets a notification when the processed audio is ready

##### Tech


###### DB
Usage of sql or nosql db would make no difference in our use case. 

###### S3 (Not Implemented)
The server would create presigned urls so the consumers could upload directly to s3. This would ensure that our server doesn't have to deal with streams / file uploads

###### Worker
Processing files is a i/o intensive operation since nodejs is single threaded even though it's done using libuv / worker pool under the hood. it's still too much work for our main service thus moving this part to some workers in a manageable way would be very beneficial from scalability point of view. 

###### Redis Pub/Sub
Usage of redis pub/sub mechanism to keep it simple but in a real world app
We would use a proper message broker like Rabbitmq or kafka

---

#### Setup

- Install lts versions of nodejs, docker and docker compose
- Install task cli globally (it's similar to [Make](https://www.computerhope.com/unix/umake.htm) in linux)
    -  `npm install -g @go-task/cli`
- Run `task init`

--- 

#### Start the development
##### Run the server
- `task s:run`

##### Run the client
- `task c:run`

--- 

#### Docs
> Make sure to run the server first
- [View Docs](http://localhost:3000/docs)

---

#### Tests

##### Run the unit tests (Ignored)
<del>
- `task s:test:run`
</del>


##### Run the e2e tests
> Initialize the test containers first using `task s:test:init`
- `task s:test:e2e:run`
--- 


#### Migrations
> Migrations are run automatically on the development, testing environments

##### Create a new migration
- `task s:migration:create -- {migration-name}`

##### Run all migrations
- `task s:migration:run`

##### Revert the latest migration
- `task s:migration:revert`

---

#### Miscellaneous

- S3 Uploads, Unit tests are ignored to save time (e2e is added for records processing)
- Integrations between frontend and backend are ignored 

- `Abbreviations`: You can replace `s` with `server` on any commands and the same goes for `c`