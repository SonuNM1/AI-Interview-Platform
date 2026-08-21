import {configureStore} from "@reduxjs/toolkit"

// global client-sdie state lives here, we will add slices as the application grows 

export const store = configureStore({
    reducer: {}
})

export type RootState = ReturnType<typeof store.getState> ;
export type AppDispatch = typeof store.dispatch ;