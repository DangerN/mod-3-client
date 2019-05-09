const apiBase = 'http://localhost:3000/api/v1/'

const exercisePath = 'exercises'

const exerciseSessionsPath = 'exercise_sessions'

const exerciseSessionPath = 'exercise_session/'

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

const exerciseMetrics = ['reps', 'time', 'distance', 'weight']

const store = {}

const testSession = 1

loadStore()
  .then(loadPage)

function loadStore() {
  return fetch(`${apiBase}${exercisePath}`)
    .then(response => response.json())
    .then(response => store.exercises = response)
}

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
  resetSelectorBox()
}

function resetSelectorBox() {
  exerciseModal.prompt.style.display = "none"
  childDestroyer(exerciseModal.dropDown)
}
function displayActiveSession(exercise) {
  let card = createExerciseCard(exercise)
  pageElements.main.appendChild(card)
}

function createExerciseCard(exercise) {
  let card = document.createElement('div')
  card.classList.add('exercise-card')
  createCounterBoxes(exercise).forEach(counterBox => card.appendChild(counterBox))
  addTitleToCard(card, exercise)
  addButtonsToActiveCard(card)
  return card
}

function addTitleToCard(card, exercise) {
  let span = document.createElement('span')
  span.innerText = exercise.name
  span.setAttribute('exercise-id', exercise.id)
  span.classList.add('title')
  card.appendChild(span)
}
function addButtonsToActiveCard(card) {
  let span = document.createElement('span')
  let button = document.createElement('button')
  button.innerText = 'Save Set'
  button.addEventListener('click', saveActiveSession)
  span.appendChild(button)
  card.appendChild(span)
}

function saveActiveSession(event) {
  let data = getValuesFromActiveCard(event.target.parentElement.parentElement)
  fetch(`${apiBase}${exerciseSessionsPath}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(showRecordCard)
}

function showRecordCard(sessionExerciseData) {
  recordCard = createRecordCard(sessionExerciseData)
  pageElements.main.appendChild(recordCard)
  return sessionExerciseData
}

function createRecordCard(sessionExerciseData) {
  let recordCard = document.createElement('div')
  recordCard.setAttribute('exercise-session-id', sessionExerciseData.id)
  let cardTitle = document.createElement('p')
  cardTitle.innerText = findExerciseById(sessionExerciseData.exercise_id).name
  recordCard.appendChild(cardTitle)
  let exerciseData = sessionExerciseDataMetricExtractor(sessionExerciseData)
  makeStatBlocks(exerciseData).forEach(stat => recordCard.appendChild(stat))
  makeRecordCardButtons(exerciseData).forEach(button => recordCard.appendChild(button))
  return recordCard
}

function makeRecordCardButtons(sessionExerciseData) {
  let editButton = document.createElement('button')
  let deleteButton = document.createElement('button')
  editButton.innerText = 'Edit'
  deleteButton.innerText = 'Delete'
  deleteButton.addEventListener('click', event => deleteRecordCard(event, sessionExerciseData.id))
  editButton.addEventListener('click', event => editRecordCard(event))
  return [editButton, deleteButton]
}

function deleteRecordCard(event, sessionExerciseId) {
  let recordCard = event.target.parentElement
  let exerciseSessionID = recordCard.getAttribute('exercise-session-id')
  deleteSessionExerciseById(exerciseSessionID)

}

function deleteSessionExerciseById(id) {
  let data = {
    id: `${id}`
  }
    fetch(`${apiBase}${exerciseSessionsPath}/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(console.log)
}

function editRecordCard(event) {

}

function sessionExerciseDataMetricExtractor(sessionExerciseData) {
  let metrics = {}
  exerciseMetrics.forEach(metric => {
    if (sessionExerciseData[metric] != null){
      metrics[metric] = sessionExerciseData[metric]
    }
  })
  return metrics
}

function makeStatBlocks(exerciseData) {
  let statBlocks = []
  for (let datum in exerciseData){
    let span = document.createElement('span')
    span.innerText = `${datum}: ${exerciseData[datum]}`
    statBlocks.push(span)
  }
  return statBlocks
}


function getValuesFromActiveCard(card) {
  let numberBoxes = card.querySelectorAll('.number-box')
  let data = {}
  numberBoxes.forEach(box => numberBoxDataExtractor(box, data))
  data['exercise_id'] = card.querySelector('.title').getAttribute('exercise-id')
  data['session_id'] = testSession
  return data
}

function numberBoxDataExtractor(box, data) {
  let attribute = box.querySelector('.number-box-title').innerText
  let value = box.querySelector('.counter-display').innerText
  data[attribute] = value
  return data
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
      if (displayNumbers.innerHTML < 99) {displayNumbers.innerHTML ++}
      break;
    case '-':
        if (displayNumbers.innerHTML > 0) {displayNumbers.innerHTML --}
        break;
    default:
  }
  if (displayNumbers.innerHTML < 10 && displayNumbers.innerHTML.length === 1) {displayNumbers.innerHTML = `0${displayNumbers.innerHTML}`}
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
  console.log(postBody)
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
  return exerciseAttributes.slice(1)
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
