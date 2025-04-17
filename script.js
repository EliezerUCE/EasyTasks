// script.js con soluciones para editar y eliminar categorías

let categories = [
  {
    title: "Categoría 1",
    img: "Predefinida.png",
    tasks: []
  }
];

// Variables
const addCategoryWrapper = document.querySelector(".add-category");
const categoryNameInput = document.getElementById("category-name-input");
const categoryImageInput = document.getElementById("category-image-input");
const imagePreview = document.getElementById("image-preview");
const previewFilename = document.querySelector(".preview-filename");
const addCategoryBtn = document.querySelector(".add-category-btn");
const cancelCategoryBtn = document.querySelector(".cancel-category-btn");

const categoriesContainer = document.querySelector(".categories");
const screenWrapper = document.querySelector(".wrapper");
const menuBtn = document.querySelector(".menu-btn");
const backBtn = document.querySelector(".back-btn");
const tasksContainer = document.querySelector(".tasks");
const numTasks = document.getElementById("num-tasks");
const categoryTitle = document.getElementById("category-title");
const categoryImg = document.getElementById("category-img");
const prioritySelect = document.getElementById("priority-select");
const dueDateInput = document.getElementById("due-date");
const addTaskWrapper = document.querySelector(".add-task");
const floatingActionButton = document.getElementById("floating-action-button");
const taskInput = document.getElementById("task-input");
const blackBackdrop = document.querySelector(".black-backdrop");
const addBtn = document.querySelector(".add-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const totalTasks = document.getElementById("total-tasks");
const urgentTasksCounter = document.getElementById("urgent-tasks");

let selectedCategory = null;
let editingCategory = null; // Para tracking de la categoría en edición

// Función para guardar en localStorage
const saveLocal = () => {
  localStorage.setItem("categories", JSON.stringify(categories));
  console.log("Datos guardados en localStorage:", categories);
  
};

// Función para cargar desde localStorage
const getLocal = () => {
  try {
    const data = JSON.parse(localStorage.getItem("categories"));
    if (data && Array.isArray(data) && data.length > 0) {
      categories = data;
      console.log("Datos cargados desde localStorage:", categories);
    } else {
      console.log("No hay datos válidos en localStorage, usando categorías por defecto");
    }
  } catch (error) {
    console.error("Error al cargar datos desde localStorage:", error);
  }
};

// Función para cambiar entre pantallas
const toggleScreen = () => {
  console.log("Cambiando pantalla");
  screenWrapper.classList.toggle("show-category");
};

const updateTotals = () => {
  let allTasks = [];
  categories.forEach(cat => {
    allTasks.push(...cat.tasks);
  });

  totalTasks.textContent = allTasks.filter(t => !t.completed).length;
};

// Función para inicializar el drag and drop de categorías
const initSortableCategorias = () => {
  const categoriasContainer = document.querySelector('.categories');
  if (!categoriasContainer) return;
  
  // Inicializar Sortable para categorías
  new Sortable(categoriasContainer, {
    animation: 150,
    ghostClass: 'category-ghost',
    chosenClass: 'category-chosen',
    dragClass: 'category-drag',
    handle: '.left', // Solo se puede arrastrar desde la parte izquierda
    onEnd: function(evt) {
      // Actualizar el orden de las categorías en el array
      const itemEl = evt.item;
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      
      if (oldIndex !== newIndex) {
        // Reordenar las categorías en el array
        const movedItem = categories.splice(oldIndex, 1)[0];
        categories.splice(newIndex, 0, movedItem);
        
        // Guardar en localStorage
        saveLocal();
        console.log('Categorías reordenadas:', categories);
      }
    }
  });
  
  console.log('Sortable para categorías inicializado');
};

// Función para inicializar el drag and drop de tareas
const initSortableTareas = () => {
  const tareasContainer = document.querySelector('.tasks');
  if (!tareasContainer) return;
  
  // Inicializar Sortable para tareas
  new Sortable(tareasContainer, {
    animation: 150,
    ghostClass: 'task-ghost',
    chosenClass: 'task-chosen',
    dragClass: 'task-drag',
    handle: '.task', // Solo se puede arrastrar desde la parte de la tarea
    onEnd: function(evt) {
      if (!selectedCategory || !selectedCategory.tasks) return;
      
      // Actualizar el orden de las tareas en el array
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;
      
      if (oldIndex !== newIndex) {
        // Reordenar las tareas en el array
        const movedItem = selectedCategory.tasks.splice(oldIndex, 1)[0];
        selectedCategory.tasks.splice(newIndex, 0, movedItem);
        
        // Guardar en localStorage
        saveLocal();
        console.log('Tareas reordenadas:', selectedCategory.tasks);
      }
    }
  });
  
  console.log('Sortable para tareas inicializado');
};


// Función para renderizar categorías con botones de editar y eliminar
const renderCategories = () => {
  console.log("Renderizando categorías:", categories);
  
  // Limpiar contenedores
  categoriesContainer.innerHTML = "";
  
  // Si no hay categorías, mostrar mensaje
  if (categories.length === 0) {
    categoriesContainer.innerHTML = `<p class="no-categories">No hay categorías. Añade una nueva.</p>`;
    return;
  }
  
  // Renderizar cada categoría
  categories.forEach(category => {
    // Calcular tareas pendientes
    const pendingTasks = category.tasks ? category.tasks.filter(t => !t.completed) : [];
    const pendingTaskCount = pendingTasks.length;
    
    // Calcular tareas urgentes (próximas a vencer en 2 días)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const urgentDate = new Date();
    urgentDate.setDate(today.getDate() + 2);
    
    const urgentTasks = pendingTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate <= urgentDate && taskDate >= today;
    });
    
    // Encontrar la tarea más próxima a vencerse
    let daysLeftText = "No hay tareas";
    if (pendingTasks.length > 0) {
      // Ordenar por fecha de vencimiento
      const sortedTasks = [...pendingTasks].sort((a, b) => 
        new Date(a.dueDate) - new Date(b.dueDate)
      );
      
      const nearestTask = sortedTasks[0];
      const nearestDate = new Date(nearestTask.dueDate);
      
      // Calcular días restantes
      const timeDiff = nearestDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      daysLeftText = daysLeft === 0 ? "¡Vence hoy!" : 
                     daysLeft === 1 ? "Vence mañana" : 
                     `${daysLeft} días restantes`;
    }
    
    // Crear el elemento de categoría
    const div = document.createElement("div");
    div.classList.add("category");
    
    // Definir el contenido HTML con los botones de editar y eliminar y la nueva información
    div.innerHTML = `
      <div class="left">
        <img src="images/${category.img}" alt="${category.title}" />
        <div class="content">
          <h1>${category.title}</h1>
          <p>${pendingTaskCount} Tareas pendientes</p>
          <p>${urgentTasks.length} Tareas urgentes</p>
          <p class="days-left">${daysLeftText}</p>
        </div>
      </div>
      <div class="category-actions">
        <span class="edit-category" title="Editar categoría">✏️</span>
        <span class="delete-category" title="Eliminar categoría">🗑️</span>
      </div>
    `;
    
    // Añadir evento de clic para abrir la categoría
    const leftPart = div.querySelector(".left");
    leftPart.addEventListener("click", function() {
      console.log("Categoría clickeada:", category.title);
      selectedCategory = category;
      categoryTitle.textContent = category.title;
      categoryImg.src = `images/${category.img}`;
      renderTasks();
      toggleScreen();
    });
    
    // Añadir eventos para editar y eliminar categoría
    const editBtn = div.querySelector(".edit-category");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Editando categoría:", category.title);
      editingCategory = category;
      
      categoryNameInput.value = category.title;
      imagePreview.src = `images/${category.img}`;
      previewFilename.textContent = category.img;
      
      document.querySelector(".add-category .heading").textContent = "Editar Categoría";
      addCategoryBtn.textContent = "Actualizar";
      
      toggleForm(addCategoryWrapper);
    });
    
    const deleteBtn = div.querySelector(".delete-category");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Eliminando categoría:", category.title);
      
      if (confirm(`¿Estás seguro de eliminar la categoría "${category.title}" y todas sus tareas?`)) {
        categories = categories.filter(c => c.title !== category.title);
        saveLocal();
        renderCategories();
        updateTotals();
      }
    });
    
    categoriesContainer.appendChild(div);
  });
  
  console.log("Categorías renderizadas:", categoriesContainer.children.length);
  
  // Inicializar Sortable para las categorías después de renderizarlas
  initSortableCategorias();
};

const renderTasks = () => {
  console.log("Renderizando tareas para categoría:", selectedCategory?.title);
  tasksContainer.innerHTML = "";
  
  if (!selectedCategory) {
    console.warn("No hay categoría seleccionada");
    return;
  }

  // Asegurarse de que tasks existe
  if (!selectedCategory.tasks) {
    selectedCategory.tasks = [];
  }

  let categoryTasks = selectedCategory.tasks;
  
  // Ya no ordenamos automáticamente por fecha para permitir el ordenamiento manual
  // Las tareas se muestran en el orden que tienen en el array

  if (categoryTasks.length === 0) {
    tasksContainer.innerHTML = `<p class='no-tasks'>No hay tareas añadidas para esta categoría</p>`;
    numTasks.textContent = "0 Tareas";
  } else {
    numTasks.textContent = `${categoryTasks.length} Tareas`;
    categoryTasks.forEach(task => {
      const div = document.createElement("div");
      div.classList.add("task-wrapper");
      div.classList.add(`priority-${task.priority}`);
      if (task.completed) div.classList.add("completed");

      const label = document.createElement("label");
      label.classList.add("task");
      label.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span class="checkmark">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <p>${task.task}</p>
      `;
      
      // Asociar event listener para el checkbox
      const checkbox = label.querySelector("input");
      checkbox.addEventListener("change", () => {
        console.log("Tarea marcada como", checkbox.checked ? "completada" : "pendiente");
        task.completed = checkbox.checked;
        saveLocal();
        renderTasks();
        updateTotals();
      });

      // CAMBIO AQUÍ: Modificar el HTML para incluir el botón eliminar en la misma línea
      div.innerHTML = `
        <div class="task-details">
          <div class="task-info">
            <span class="due-date">${formatDate(task.dueDate)}</span>
            <span class="priority ${task.priority}">${task.priority.toUpperCase()}</span>
          </div>
          <div class="delete">🗑️</div>
        </div>
      `;

      div.prepend(label);
      
      // Asociar event listener para eliminar
      const deleteBtn = div.querySelector(".delete");
      deleteBtn.addEventListener("click", () => {
        console.log("Eliminando tarea:", task.task);
        selectedCategory.tasks = selectedCategory.tasks.filter(t => t.id !== task.id);
        saveLocal();
        renderTasks();
        updateTotals();
      });

      tasksContainer.appendChild(div);
    });
  }
  
  // Inicializar Sortable para las tareas después de renderizarlas
  initSortableTareas();
};

const formatDate = (date) => {
  // Crear un objeto de fecha
  const dateObj = new Date(date);
  
  // Opciones para formatear la fecha completa
  const options = { 
    weekday: 'long', // día de la semana completo
    year: 'numeric', // año (número)
    month: 'long',   // mes completo
    day: 'numeric'   // día (número)
  };
  
  // Formato de fecha completo en español
  return dateObj.toLocaleDateString("es-ES", options);
};


// Función generalizada para mostrar/ocultar formularios
const toggleForm = (formElement) => {
  // Cerrar cualquier otro formulario que pudiera estar abierto
  if (formElement === addTaskWrapper && addCategoryWrapper.classList.contains("active")) {
    addCategoryWrapper.classList.remove("active");
  } else if (formElement === addCategoryWrapper && addTaskWrapper.classList.contains("active")) {
    addTaskWrapper.classList.remove("active");
  }
  
  // Alternar el estado del formulario actual
  const wasActive = formElement.classList.contains("active");
  formElement.classList.toggle("active");
  
  // Actualizar el estado del backdrop y el botón según el estado actual de los formularios
  const isAnyFormActive = addTaskWrapper.classList.contains("active") || 
                         addCategoryWrapper.classList.contains("active");
  
  blackBackdrop.classList.toggle("active", isAnyFormActive);
  floatingActionButton.classList.toggle("active", isAnyFormActive);
  
  // Si cerramos un formulario y no hay otros abiertos, asegurarse de que el botón no esté activo
  if (wasActive && !isAnyFormActive) {
    floatingActionButton.classList.remove("active");
  }
};

// Función para añadir tareas (modificada para usar la categoría seleccionada)
const addTask = () => {
  const task = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = prioritySelect.value;

  if (!task || !dueDate) {
    alert("Por favor completa todos los campos.");
    return;
  }

  if (!selectedCategory) {
    alert("No hay una categoría seleccionada.");
    return;
  }
  
  if (!selectedCategory.tasks) {
    selectedCategory.tasks = [];
  }
  
  const newTask = { 
    id: Date.now(), 
    task, 
    completed: false, 
    dueDate, 
    priority 
  };
  
  console.log("Añadiendo tarea:", newTask);
  selectedCategory.tasks.push(newTask);

  taskInput.value = "";
  
  // Cerrar el formulario de manera explícita
  addTaskWrapper.classList.remove("active");
  blackBackdrop.classList.remove("active");
  floatingActionButton.classList.remove("active");
  
  saveLocal();
  renderCategories();
  renderTasks();
  updateTotals();
};

// Función para añadir o actualizar categorías
const addCategory = () => {
  const nombre = categoryNameInput.value.trim();
  
  if (!nombre) {
    alert("Por favor ingrese un nombre para la categoría.");
    return;
  }
  
  // Si estamos editando
  if (editingCategory) {
    // Verificar si el nombre ya existe en otra categoría
    if (nombre !== editingCategory.title && categories.some(cat => cat.title === nombre)) {
      alert("Ese nombre de categoría ya existe.");
      return;
    }
    
    // Determinar la imagen
    let img = editingCategory.img; // Mantener la imagen actual por defecto
    
    // Si se seleccionó un nuevo archivo, extraer el nombre
    if (categoryImageInput.files && categoryImageInput.files[0]) {
      img = categoryImageInput.files[0].name;
    }
    
    // Actualizar la categoría
    editingCategory.title = nombre;
    editingCategory.img = img;
    
    console.log("Categoría actualizada:", editingCategory);
    
    // Si esta categoría está seleccionada, actualizar la vista
    if (selectedCategory === editingCategory) {
      categoryTitle.textContent = nombre;
      categoryImg.src = `images/${img}`;
    }
    
    // Reiniciar el estado de edición
    editingCategory = null;
    document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
    addCategoryBtn.textContent = "Agregar";
  } 
  // Si estamos añadiendo una nueva categoría
  else {
    // Comprobar si ya existe
    if (categories.some(cat => cat.title === nombre)) {
      alert("Esa categoría ya existe.");
      return;
    }
    
    // Determinar la imagen
    let img = "Predefinida.png"; // Valor predeterminado
    
    // Si se seleccionó un archivo, extraer el nombre
    if (categoryImageInput.files && categoryImageInput.files[0]) {
      img = categoryImageInput.files[0].name;
    }
    
    // Crear nueva categoría 
    const newCategory = {
      title: nombre,
      img: img,
      tasks: []
    };
    
    console.log("Añadiendo nueva categoría:", newCategory);
    categories.push(newCategory);
  }

  // Limpiar el formulario
  categoryNameInput.value = "";
  categoryImageInput.value = "";
  imagePreview.src = "images/Predefinida.png";
  previewFilename.textContent = "Predefinida.png";
  
  // Guardar y actualizar interfaz
  saveLocal();
  renderCategories();
  updateTotals();
  
  // Cerrar el formulario de manera explícita
  addCategoryWrapper.classList.remove("active");
  blackBackdrop.classList.remove("active");
  floatingActionButton.classList.remove("active");
};

// Función para determinar qué formulario mostrar
const handleFloatingAction = () => {
  // Si el botón ya está activo (girado), cerramos el formulario que esté abierto
  if (floatingActionButton.classList.contains("active")) {
    // Cerramos el formulario de tareas si está abierto
    if (addTaskWrapper.classList.contains("active")) {
      toggleForm(addTaskWrapper);
    } 
    // Cerramos el formulario de categorías si está abierto
    else if (addCategoryWrapper.classList.contains("active")) {
      toggleForm(addCategoryWrapper);
      
      // Reiniciar estado de edición si cancelamos
      if (editingCategory) {
        editingCategory = null;
        document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
        addCategoryBtn.textContent = "Agregar";
        categoryNameInput.value = "";
        categoryImageInput.value = "";
        imagePreview.src = "images/Predefinida.png";
        previewFilename.textContent = "Predefinida.png";
      }
    }
  } 
  // Si no está activo, mostramos el formulario correspondiente
  else {
    if (screenWrapper.classList.contains("show-category")) {
      toggleForm(addTaskWrapper);
    } else {
      toggleForm(addCategoryWrapper);
    }
  }
};

// Agregar esta función para manejar el botón flotante
const handleFloatingButtonClick = () => {
  const isButtonActive = floatingActionButton.classList.contains("active");
  
  if (isButtonActive) {
    // Si el botón está activo, cerrar todos los formularios
    if (addTaskWrapper.classList.contains("active")) {
      toggleForm(addTaskWrapper);
    }
    if (addCategoryWrapper.classList.contains("active")) {
      // Si estábamos editando, reiniciar el estado
      if (editingCategory) {
        editingCategory = null;
        document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
        addCategoryBtn.textContent = "Agregar";
        categoryNameInput.value = "";
        categoryImageInput.value = "";
        imagePreview.src = "images/Predefinida.png";
        previewFilename.textContent = "Predefinida.png";
      }
      toggleForm(addCategoryWrapper);
    }
  } else {
    // Si el botón no está activo, mostrar el formulario correspondiente
    if (screenWrapper.classList.contains("show-category")) {
      toggleForm(addTaskWrapper);
    } else {
      toggleForm(addCategoryWrapper);
    }
  }
};


// Función para manejar la vista previa de imagen
const handleImageInput = () => {
  const file = categoryImageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      previewFilename.textContent = file.name;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "images/Predefinida.png";
    previewFilename.textContent = "Predefinida.png";
  }
};

// Función para limpiar localStorage (para debugging)
const clearStorage = () => {
  localStorage.removeItem("categories");
  categories = [
    {
      title: "Categoría 1",
      img: "Predefinida.png",
      tasks: []
    }
  ];
  renderCategories();
  updateTotals();
  alert("LocalStorage limpiado. Categorías reiniciadas.");
};

// Función para inicializar la aplicación
const initApp = () => {
  console.log("Inicializando aplicación...");
  
  // Cargar datos
  getLocal();

  // Event listeners previos...
  menuBtn.addEventListener("click", () => {
    console.log("Menú clickeado");
    toggleScreen();
  });
  
  backBtn.addEventListener("click", () => {
    console.log("Botón atrás clickeado");
    toggleScreen();
  });
  
  // Configurar los event listeners para los formularios
  blackBackdrop.addEventListener("click", () => {
    // Cerrar cualquier formulario abierto
    addTaskWrapper.classList.remove("active");
    addCategoryWrapper.classList.remove("active");
    blackBackdrop.classList.remove("active");
    floatingActionButton.classList.remove("active");
    
    // Reiniciar estado de edición si estábamos editando
    if (editingCategory) {
      editingCategory = null;
      document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
      addCategoryBtn.textContent = "Agregar";
      categoryNameInput.value = "";
      categoryImageInput.value = "";
      imagePreview.src = "images/Predefinida.png";
      previewFilename.textContent = "Predefinida.png";
    }
  });
  
  // Event listeners para cancelar formularios
  cancelBtn.addEventListener("click", () => {
    addTaskWrapper.classList.remove("active");
    blackBackdrop.classList.remove("active");
    floatingActionButton.classList.remove("active");
  });
  
  cancelCategoryBtn.addEventListener("click", () => {
    console.log("Botón cancelar categoría clickeado");
    addCategoryWrapper.classList.remove("active");
    blackBackdrop.classList.remove("active");
    floatingActionButton.classList.remove("active");

    // Reiniciar estado de edición si cancelamos
    if (editingCategory) {
      editingCategory = null;
      document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
      addCategoryBtn.textContent = "Agregar";
      categoryNameInput.value = "";
      categoryImageInput.value = "";
      imagePreview.src = "images/Predefinida.png";
      previewFilename.textContent = "Predefinida.png";
    }
  });

  // Event listeners para agregar elementos
  addBtn.addEventListener("click", addTask);
  addCategoryBtn.addEventListener("click", addCategory);
  categoryImageInput.addEventListener("change", handleImageInput);
  
  // Botón flotante con lógica simplificada y robusta
  floatingActionButton.addEventListener("click", () => {
    // Si algún formulario está activo, cerrar todos los formularios
    if (addTaskWrapper.classList.contains("active") || addCategoryWrapper.classList.contains("active")) {
      // Cerrar formularios
      addTaskWrapper.classList.remove("active");
      addCategoryWrapper.classList.remove("active");
      blackBackdrop.classList.remove("active");
      floatingActionButton.classList.remove("active");
      
      // Reiniciar estado de edición si cancelamos
      if (editingCategory) {
        editingCategory = null;
        document.querySelector(".add-category .heading").textContent = "Agregar Categoría";
        addCategoryBtn.textContent = "Agregar";
        categoryNameInput.value = "";
        categoryImageInput.value = "";
        imagePreview.src = "images/Predefinida.png";
        previewFilename.textContent = "Predefinida.png";
      }
    } 
    // Si no hay formularios activos, mostrar el formulario correspondiente
    else {
      // Determinar qué formulario mostrar según la pantalla actual
      if (screenWrapper.classList.contains("show-category")) {
        addTaskWrapper.classList.add("active");
      } else {
        addCategoryWrapper.classList.add("active");
      }
      
      // Activar backdrop y botón
      blackBackdrop.classList.add("active");
      floatingActionButton.classList.add("active");
    }
  });

  // Configurar fecha mínima para el input de fecha
  const today = new Date().toISOString().split("T")[0];
  dueDateInput.setAttribute("min", today);

  // Renderizar la interfaz inicial
  renderCategories();
  updateTotals();
  
  console.log("Aplicación inicializada correctamente");
};

// Para debugging: permite reiniciar la aplicación desde la consola
window.resetApp = clearStorage;

document.addEventListener("DOMContentLoaded", initApp);