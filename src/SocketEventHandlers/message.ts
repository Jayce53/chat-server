import {Socket} from "socket.io";
import {userStore} from "@/classes/UserStore";
import {Conversation} from "@/classes/Conversation";
import {SocketEventHandler} from "@/classes/SocketEventHandler";
import {EventNames} from "@/eventnames";

/**
 * Export the event name so we can recognise unhandled events
 */
export const event = EventNames.MESSAGE;

/**
 * We got a message from a user
 *
 * Check that the sender and the recipient exist
 * Check that the sender and the recipient are online
 *
 * Check that the recipient has not blocked the sender
 * Check that the sender has not blocked the recipient
 *
 * Send the message to the recipient
 * Add the message to the conversation DB
 *
 */

async function msgHandler(socket: Socket, receipientId: number, msg: string) {
  console.log(`msg from ${socket.userId} on socket ${socket.id}  for ${receipientId}: ${msg}`);
  const recipient = userStore.getUser(receipientId);
  if (!recipient) {
    console.log(`No recipient found for id: ${receipientId}`);
    return;
  }
  const sender = userStore.getUser(socket.userId!);
  if (!sender) {
    console.log(`No sender found for id: ${socket.userId}`);
    return;
  }
  const recipientSocket = userStore.getSocket(receipientId);
  if (!recipientSocket) {
    console.log(`No recipient socket found for id: ${receipientId}`);
    return;
  }
  console.log(`Sending "${msg}" to ${receipientId} on ${recipientSocket.id} (Socket userId: ${recipientSocket.userId}) `);
  recipientSocket.emit(EventNames.MESSAGE, socket.userId, msg);
  const conversation = await Conversation.get(socket.userId!, receipientId);
  await conversation.addMessage(socket.userId!, msg);
}

SocketEventHandler.register(EventNames.MESSAGE, msgHandler);
