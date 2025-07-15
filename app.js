
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCmO4qQwfyJmobpQrQjEYjfqFMnEOSKGb0",
  authDomain: "arturo-849ba.firebaseapp.com",
  databaseURL: "https://arturo-849ba-default-rtdb.firebaseio.com",
  projectId: "arturo-849ba",
  storageBucket: "arturo-849ba.firebasestorage.app",
  messagingSenderId: "231542403682",
  appId: "1:231542403682:web:1d6c15ed607432dc4c173b",
  measurementId: "G-V5R8LJRPSW"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Usuario registrado"))
    .catch(e => alert(e.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Bienvenido"))
    .catch(e => alert(e.message));
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("reserva-section").style.display = "block";
    document.getElementById("user-info").innerText = `Usuario: ${user.email}`;

    mostrarReservas(user.uid);
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("reserva-section").style.display = "none";
  }
});

function reservar() {
  const fechaInput = document.getElementById("fecha");
  const horaInput = document.getElementById("hora");
  const labInput = document.getElementById("laboratorio");
  const user = auth.currentUser;

  // Validar si la fecha es anterior a la actual
  const fechaActual = new Date();
  const fechaSeleccionada = new Date(fechaInput.value);

  if (fechaSeleccionada <= fechaActual) {
    alert("No se pueden hacer reservas en fechas anteriores a la actual.");
    limpiarCampos(); // Limpiar campos si la fecha es inválida
    return;
  }

  // Validar si ya existe una reserva duplicada
  db.collection("reservas")
    .where("uid", "==", user.uid)
    .where("fecha", "==", fechaInput.value)
    .where("hora", "==", horaInput.value)
    .where("laboratorio", "==", labInput.value)
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        alert("Ya tienes una reserva en esta fecha y hora para este laboratorio.");
        limpiarCampos(); // Limpiar campos si hay una reserva duplicada
        return;
      }

      // Si no hay reservas duplicadas, proceder a agregar la nueva reserva
      db.collection("reservas").add({
        uid: user.uid,
        email: user.email,
        fecha: fechaInput.value,
        hora: horaInput.value,
        laboratorio: labInput.value
      }).then(() => {
        alert("Reservación registrada");
        mostrarReservas(user.uid);
        limpiarCampos(); // Limpiar campos después de registrar
      });
    }).catch((error) => {
      console.error("Error al verificar reservas: ", error);
      alert("Ocurrió un error al verificar las reservas.");
      limpiarCampos(); // Limpiar campos en caso de error
    });
}

// Función para limpiar los campos de entrada
function limpiarCampos() {
  document.getElementById("fecha").value = "";
  document.getElementById("hora").value = "";
  document.getElementById("laboratorio").value = "";
}

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("reserva-section").style.display = "block";
    document.getElementById("user-info").innerText = `Usuario: ${user.email}`;
    console.log("UID del usuario:", user.uid); // Verifica el UID
    mostrarReservas(user.uid); // Llama a la función para mostrar reservas
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("reserva-section").style.display = "none";
  }
});
function mostrarReservas(uid) {
  console.log("Mostrando reservas para UID:", uid);
  const tabla = document.querySelector("#tabla-reservas tbody");
  tabla.innerHTML = ""; // Limpiar contenido anterior

  db.collection("reservas")
    .where("uid", "==", uid)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const fila = document.createElement("tr");

        fila.innerHTML = `
          <td>${data.fecha}</td>
          <td>${data.hora}</td>
          <td>${data.laboratorio}</td>
        `;

        tabla.appendChild(fila);
      });
    })
    .catch(error => {
      console.error("Error al mostrar reservas: ", error);
    });
}



