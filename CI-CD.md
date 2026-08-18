## CI

- CI stands for Continuous Integration 

- Its the practice of automatically validating code whenever developers push code or create/update a Pull Request 

- The purpose of CI is to catch problems early before broken code is merged into the main branch 

- Typical CI checks include: Installing dependencies, TS type checking, ESLint, Unit tests, Integration tests, Build verification, Security/dependency checks, Code coverage checks 

## CI isn't same as Git Push 

- CI does not normally prevent a developer from pushing code to GitHub 

- The developer can push code: 

`Developer -> Git Push -> GitHub -> GitHub Actions -> CI Checks -> PASS / FAIL`

- The important part is that GitHub can enforce these checks before allowing a Pull Request to be merged. 

    This is called CI Quality Gate. 

## CI Quality Gate 

A quality gate is a set of automated checks that must pass before code can be merged. 

    If any required check fails, the Pull Request should not be merged. 

## GitHub Actions 

- GitHub Actions is commonly used to implement CI pipelines. 

- A workflow is normally stored inside: 

```js
.github/
└── workflows/
    └── ci.yml
```

## Unit Testing 

Unit tests test a small isolated piece of code. 

- Examples: Password hashing function, JWT generation, Validation function, Service function, Utility function 

- Unit tests are generally fast and independent. 

## Integration Testingn 

Integration tests verify that multiple parts of the application work together. 

- Examples: API -> Controller -> Service -> Database 

    Auth Service -> RabbitMQ -> Notification Service -> Redis 

- Integration tests are useful for verifying real application flows rather than isolated functions. 

## CI vs CD 

**Continuous Integration:** 

Concerned primarily with: 

- Code quality, 
- Type safety, 
- Tests, 
- Build correctness 

**Continuous Deployment:**

Concerned with: 

- Building production artifacts 
- Docker images
- Deploying services
- Runninig infrastructure 
- Environment configuration 