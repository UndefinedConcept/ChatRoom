<div align="center">
    <h1>
        Project: ChatRoom
    </h1>
    <p>
        WebSocket Chatroom with Packet Visualization
    </p>   
</div>

## Project Overview

This project aims to develop a WebSocket-based chat room website that provides real-time communication between users. Additionally, the website will visualize the internet traffic by sending and tracking packets between the client and server. This project combines the concepts of WebSockets, real-time web applications, and network packet analysis. This website is hosted on Raspberry Pi and Asus Wireless Router.

## Objectives

- Develop a real-time chatroom using WebSockets
- Visualize the internet traffic between client and server
- Enhance understanding of WebSocket communication and packet encryption
- Provide an interactive and educational tool for users to explore internet traffic

### Features

- Real-time chatroom with multiple users
- Server hosted on a Raspberry Pi with NGINX
- Packet visualization showing the flow of messages between client and server
- User-friendly interface with interactive elements
- Logging and analysis of packet data

## Technologies Used

- HTML, CSS, JavaScript for frontend development
- Node.js and Express for backend development
- WebSocket library for real-time communication
- Wireshark or similar tools for packet analysis

## Core Project Structure
```Plaintext
project-directory/
│
├── Client/
│   ├── css/styles.css   # Stylesheet
│   ├── fonts/...        # Inter Font
│   ├── index.html       # Inital Login Page
│   ├── index.js         # Login Configurations
│   ├── chat.html        # Chat Page
│   ├── chat.js          # Main Client JS
│
├── Server/
│   ├── server.js        # Node.js server
│
├── package.json         # Project metadata and dependencies
│
├── README.md            # Documentation

```

## Prerequisites
Before starting, ensure you have the following installed:
- **VSCode**: Download and install from [here](https://code.visualstudio.com/download).
- **Node.js**: Download and install from [here](https://nodejs.org/) (recommended prebuilt Node.js).
- **npm**: Comes pre-installed with Node.js (type `npm -v` to check).

## Installation
Follow these steps to set up the project:

1. Clone the repository or download the project folder and open it.
```bash
git clone https://github.com/UndefinedConcept/ChatRoom.git
cd ChatRoom
```
2. Install the required dependencies
```bash
npm install
```
3. Running the Server
```bash
node Server/server.js
```
4. Running the Client
   - In "Explorer", open up `Client/index.html`
   - In "Run and Debug" (found on the left sidebar of VSCode) or `Ctrl` + `Shift` + `D`
   - Press the `Run and Debug` button in "Run and Debug" (opens file in your drive)

5. Your application will open in your default browser.
> To get the full demo experience, open the console on your browser using `Ctrl`+`Shift`+`J` (Windows/Linux) or `Command`+`Option`+`J` (Mac) to view the data your device sends and receives for the chatroom. You can also open the "Debug Console" on VSCode to see the console of all the active clients.

## Usage

- Open the ChatRoom website in a browser
- Join the chatroom by entering a username
- Send messages to other users in real-time
- Observe the packet visualization to understand the flow of data

## Contributing

We welcome contributions from the community. To contribute, please fork the repository and submit a pull request with your changes. Make sure to follow the coding guidelines and include documentation for any new features.

## License

This project is licensed under the MIT License \- see the [LICENSE](https://github.com/UndefinedConcept/ChatRoom/blob/main/LICENSE) file for details.

## Contact

For any questions or feedback, please reach out to [SuperExago](https://github.com/jpang9431) or [UndefinedConcept](https://github.com/UndefinedConcept).
