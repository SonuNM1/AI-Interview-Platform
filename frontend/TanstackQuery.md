- React state manages state owned by the UI. TanStack Query manages state owned by the server. 

- TanStack Query purpose: fetching, caching, synchronizing and updating server state. 

- **TanStack Query** is primarily a server-state management and data-fetching library. It handles fetching, caching, synchronization, refetching, mutations, loading/error states, and keeping server data resonably fresh.

### The core problem TanStack Query solves 

A normal React application often starts with: 

```js
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch("/api/users")
    .then((res) => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

This works. But as the application grows, you start needing: 

- caching
- refetching 
- retrying failed requests
- knowing whether cached data is stale 
- sharing the same API data between components
- background updates
- pagination 
- infinite scrolling 
- mutations 
- invalidating old data after an update 
- optimistic updates
- deduplicating requests 

We can build all of this, but that's a lot of infrstructure. 

**TanStack Query provides that infrastructure**

### Server State vs Client State 

- Client state: State that belongs to the application/browser

    isModalOpen, isSidebarOpen, selectedTab, theme, inputValue, isEditing

    Usually, useState() or Context, Redux, Zustand 

- Server state: Data that lives on your backend. 

    products, users, orders, messages, notifications, interviews, comments, posts

    Example: Database -> Backend API -> GET /users -> React application 

    This is server state. 

- TanStack Query is designed specifically for this kind of data (server data). Server state is remote, asynchronous, can becomoe stale, can be shared by multiple components, and can change outside the current component. 

                 Application State

             ┌────────────┴────────────┐
             │                         │
        Client State              Server State
             │                         │
        useState / Redux          TanStack Query
        Context / Zustand

    
- Example: 

    const [isEditing, setIsEditing] = useState(false) 

    Keep this. But: 

    const [users, setUsers] = useState([]) ; 

    If users comes from an API, this is a candidate for TanStack Query. 


## 3 Core Concepts 

The 3 things we should learn first are" 

1. Query
2. Mutation 
3. Invalidation 

### Query 

- A query reads/fetches server data 

- Typical examples: 

    ```js
    GET /users
    GET /users/:id
    GET /products
    GET /orders
    GET /notifications
    ```

- In TanStack Query: `useQuery()`

- Basic example: 

    ```js
    const {data, isPending, error} = useQuery({
        queryKey: ["users"],
        queryFn: getUsers 
    })
    ```

    where: queryKey -> identifies the data 

           queryFn -> fetches the data 


### Query Key 

- `queryKey: ["users"]` Think of the query key as the identity/name of the cached server data 

    ["users"] means: The users collection 

    While ["user", 123] means: User with ID 123 

- TanStack Query uses query keys to identify, cache, share, refetch and invalidate queries 

### Query Function

- The query function is responsible for actually calling the API 

- Example: 

    ```js
    async function getUsers() {
    const response = await axios.get("/users");

    return response.data;
    }
    ```

Then: 

    ```js
    useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    });
    ```

### Mutation 

- Queries generally read server data. 

- Mutations are for operations that change data or cause server-side effects. 

    POST, PUT, PATCH, DELETE 

- Examples: Create user, Update profile, Delete post, Upload file, Change password, Like post, Create order 

- Use: `useMutation()`

**Query vs Mutation**

I want to READ something -> Query 

I want to CHANGE something -> Mutation 

- Examples: 

    ```js
    GET /users -> Query 

    GET /users/123 -> Query 

    POST /users -> Mutation

    PATCH /users/123 -> Mutation 

    DELETE /users/123 -> Mutation
    ```

### Optimistic Updates 

- Suppose clicking: `Like` takes 500ms 

- Without optimistic UI: Click -> API request -> Server -> Response -> UI changes 

- With optimistic update: Click -> UI changes immediately -> API request -> Server -> Success 

- It feels faster, but you need to rollback if the server rejects it. 

### When NOT to use TanStack Query 

Don't use TanStack Query for: 

- input values 
- modal state
- dropdown state
- sidebar state
- animation state 
- temporary UI state 

