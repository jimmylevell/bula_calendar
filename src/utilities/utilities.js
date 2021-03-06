import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// function to create unique event ID
function createEventId() {
    return uuidv4()
}

// javascript date to the format required by fullcalendar
function convertDateToIso(date) {
    return moment(date).toISOString(true).substring(0, 16)
}

export { createEventId, convertDateToIso}