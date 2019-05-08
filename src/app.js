const apiBase = 'http://localhost:3000/api/v1/'

const exercisePath = 'exercises'

const pageElements = {
    home:  document.querySelector('#home-button'),
    out: document.querySelector('#out-button'),
    in: document.querySelector('#in-button'),
    record: document.querySelector('#record-button'),
    context: document.querySelector('.context-menu'),
    main: document.querySelector('.main')
}

const exerciseModal = {
  prompt: document.querySelector('#exercise-modal'),
  dropDown: document.querySelector('.exercise-dropdown'),
  close: document.querySelector('.exercise-close-button'),
  new: document.querySelector('#new-exercise-button'),
  newForm: document.querySelector('.new-exercise-form'),
  newExerciseSubmit: document.querySelector('.new-exercise-submit'),
  selectExercise: document.querySelector('#exercise-select')
}

const store = {}

fetch('http://localhost:3000/api/v1/exercises')
  .then(response => response.json())
  .then(response => store.exercises = response)
  .then(loadPage)

function loadPage() {
  listenToNav()
}

function listenToNav() {
  pageElements.home.addEventListener('click', showHome)
  pageElements.out.addEventListener('click', showOut)
  pageElements.in.addEventListener('click', showIn)
  pageElements.record.addEventListener('click', showRecord)
}

function clearMain() {
  let main = document.querySelector('.main')
  childDestroyer(main)
}

function clearContextMenu() {
  childDestroyer(pageElements.context)
}

function childDestroyer(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function showHome() {
  clearMain()
  showContextMenu('home')
}

function showOut() {
  clearMain()
  showContextMenu('out')
}

function showIn() {
  clearMain()
  showContextMenu('in')
}

function showRecord() {
  clearMain()
  showContextMenu('record')
}

function showContextMenu(context) {
  clearContextMenu()
  switch (context) {
    case 'home':

      break;
    case 'out':
      pageElements.context.appendChild(makeChild('a', 'new session', exerciseSelectBox))
      break;
    case 'in':

      break;
    case 'record':

      break;
    default:

  }
}

function makeChild(type, display, action) {
  let a = document.createElement(type)
  a.innerText = display
  if (action){ a.addEventListener('click', action)}
  return a
}

function exerciseSelectBox() {
  displayExerciseSelectBox()
  populateExerciseDropDown()
  listenForExerciseInput()
}

function listenForExerciseInput() {
  exerciseModal.new.addEventListener('click', _ => {exerciseModal.newForm.style.display = 'block'})
  exerciseModal.newForm.addEventListener('submit', addAndBeginNewExercise)
  exerciseModal.selectExercise.addEventListener('submit', exerciseSelector)
}

function exerciseSelector(event) {
  event.preventDefault()
  displayActiveSession(findExerciseById(exerciseModal.dropDown.value))
}

function displayActiveSession(exercise) {
  let card = createExerciseCard(exercise)
  // let counterBoxes = createCounterBoxes(exercise)
  pageElements.main.appendChild(card)
}

function createExerciseCard(exercise) {
  let card = document.createElement('div')
  // card.appendChild(createCounterBoxes(exercise))
  createCounterBoxes(exercise).forEach(counterBox => card.appendChild(counterBox))
  return card
}

function createCounterBoxes(exercise) {
  return exercise.exercise_type
    .split(' ')
    .map(numberBoxByTypeString)
}

function numberBoxByTypeString(typeString) {
  let div = document.createElement('div')
    div.classList.add('number-box')
    div.innerHTML = `
        <p class='number-box-title'>${typeString}</p>
        <div class="digit-box">
          <div class='counter-display'>00</div>
          <button class='counter'>+</button>
          <button class='counter'>-</button>
        </div>
    `
    let counters = div.querySelectorAll('.counter')
    let display = div.querySelector('.counter-display')
    counters[0].addEventListener('click', event => adjustCounter(event, '+'))
    counters[1].addEventListener('click', event => adjustCounter(event, '-'))
    return div
}

function adjustCounter(event, operator) {
  let displayNumbers = event.target.parentElement.querySelector('.counter-display')
  switch (operator) {
    case '+':
      displayNumbers.innerHTML ++
      break;
    case '-':
        displayNumbers.innerHTML --
        break;
    default:

  }

}

function findExerciseById(id) {
  return store.exercises.find( exercise => exercise.id == id)
}

function addAndBeginNewExercise(event) {
  event.preventDefault()
  let attributeString = getCheckedExerciseAttributes(event.target)
  let exerciseName = event.target.name.value
  let postBody = {
    name: exerciseName,
    exercise_type: attributeString
  }
  fetch(`${apiBase}${exercisePath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    body: JSON.stringify(postBody)
  })
  .then(response => response.json())
  .then(response => console.log(response))
  console.log(attributeString, exerciseName)
}

function getCheckedExerciseAttributes(form) {
  let exerciseAttributes = ''
  for (let input of form){
    if (input.checked === true) {
      exerciseAttributes += ` ${input.name}`
    }
  }
  return exerciseAttributes
}

function displayExerciseSelectBox() {
  exerciseModal.prompt.style.display = "block"
  exerciseModal.close.addEventListener('click', closeExerciseSelectBox)
}

function closeExerciseSelectBox() {
  exerciseModal.prompt.style.display = "none"; childDestroyer(exerciseModal.dropDown)
}

function populateExerciseDropDown() {
  store.exercises.forEach( exercise =>{
    let option = document.createElement('option')
    option.innerText = exercise.name
    option.value = exercise.id
    exerciseModal.dropDown.appendChild(option)
  })
}

// function createNewSession() {
//   let div = document.createElement('div')
//   div.classList.add('exercise-card')
//   div.innerHTML = `
//       <div class="number-box">
//         <div class='counter-display'>00</div>
//         <button class='counter'>+</button>
//         <button class='counter'>-</button>
//       </div>
//       <div class="number-box">00</div>
//       <a id="save-set">Save Set</a>
//   `
//   pageElements.main.appendChild(div)
// }
