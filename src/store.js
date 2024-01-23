import { writable } from 'svelte/store';

export const currentPage = writable('home');
export const players = writable([]);
export const activeInput = writable('');