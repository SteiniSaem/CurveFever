import { writable } from 'svelte/store';

export const currentPage = writable('home');
export const players = writable({});
export const activeInput = writable('');
export const canvasDimmensions = writable({width: 1667, height: 1000});
export const maxScore = writable(null);