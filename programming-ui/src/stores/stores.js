import { readable } from "svelte/store";
import { writable } from 'svelte/store';

const points = writable(0);

let user = localStorage.getItem("userUuid");

if (!user) {
  user = crypto.randomUUID().toString();
  localStorage.setItem("userUuid", user);
} 

export const userUuid = readable(user);
export { points };