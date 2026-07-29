Create Interview
List Interviews
Get Interview
Update Interview
Delete Interview
Start Interview
End Interview

## GraphQL 

GraphQL is a query language for APIs, developed by Facebook in 2015. 

Normally, with REST we have many endpoints

GET /users
GET /users/1
GET /interviews
GET /interviews/1
GET /candidates
GET /recruiters

With GraphQL, we typically have one endpoint: 

POST /graphql 

The client sends a query describing exactly what data it wants. The frontend asks only for what it needs. 

EXAMPLE 

Dashboard needs: Interview title, Recruiter name, Candidate count 

REST - 

GET /interviews/1
GET /users/10
GET /candidates?interview=1

 Therefore, 3 API calls 

GraphQL - only one request 

**WHY WAS GRAPHQL CREATED?**

Facebook had two major problems: 

Problem 1 - Over-fetching: REST sends too much data. Need: title. Gets: title, description, duration, status, feedback, createdBy, etc 

    Waste of bandwidth 

Problem 2 - Under-fetching: Need - Interview, Recruiter, Candidate

    REST: Get interview -> Get recruiter -> Get candidate 

    multiple requests. GraphQL combines them. 

How does RabbitMQ Work? 

Instead of Controllers and Routes, GraphQL uses Resolvers. 

**Resolver**

Think of it as a controller.