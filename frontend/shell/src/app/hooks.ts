import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import type { AppDispatch, RootState } from "./store";

// Typed dispatch hook so Redux actions are type-safe

export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed selector hook so Redux state is type-safe

export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;