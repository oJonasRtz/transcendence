import { io } from "socket.io-client";

export function helloWorld() {
	document.getElementById("msg")!.innerText = "Hello, World";
}
