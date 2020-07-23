const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// const autoscroll = () => {
//   // New message element
//   const $newMessage = $messages.lastElementChild

//   // Height of the new message
//   const newMessageStyle = getComputedStyle($newMessage)
//   const newMessageMargin = parseInt(newMessageStyle.marginBottom)
//   const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//   // Visible Height
//   const visibleHeight = $messages.offsetHeight

//   // Height of message container
//   const containerHeight = $messages.scrollHeight

//   // How far have I Scrolled?
//   const scrollOffset = $messages.scrollTop + visibleHeight

//   if(containerHeight - newMessageHeight <= scrollOffset) {
//     $messages.scrollTop = $messages.scrollHeight
//   }
// }

socket.on('locationMessage', (message) => {
  console.log(message)
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  $messages.scrollTop = $messages.scrollHeight
  // autoscroll()
})

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  $messages.scrollTop = $messages.scrollHeight
  // autoscroll()
});

socket.on("roomData", ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disable button
  $messageFormButton.setAttribute('disabled', 'disabled')

  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {

    //enable
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if(error) {
      alert(error)
      return location.href = '/'
    }
    console.log('Message Deilvered!')
  });
});

$sendLocationButton.addEventListener("click", () => {

  if (!navigator.geolocation) {
    return alert("Geolcation is not supported by your browser!");
  }

  //disable location button
$sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }, () => {
      //enable button in acknowledgement callback
      $sendLocationButton.removeAttribute('disabled')
      console.log('Location Shared!')
    });
  });
});

socket.emit('join', {username, room}, (error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})