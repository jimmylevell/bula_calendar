import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import EventEditor from '../components/eventEditor'

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

// define some basic events which are being showed when starting up the application
const INITIAL_EVENTS_STANDARD = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: todayStr, 
    end: todayStr
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: todayStr + 'T13:00:00',
    end: todayStr + 'T15:00:00'
  }
]
const INITIAL_EVENTS_BLOCKING = [
  {
    id: createEventId(),
    title: "Welcome Event",
    start: todayStr + 'T10:00:00',
    end: todayStr + 'T12:00:00',
    overlap: false,
    rendering: 'background',
    color: '#ff9f89'
  }
]
const INITIAL_EVENTS = INITIAL_EVENTS_STANDARD.concat(INITIAL_EVENTS_BLOCKING)

// define range of calendar view
const START_DATE = '2021-01-04'
const END_DATE = '2021-01-18' // end date + 1

function createEventId() {
  return String(eventGuid++)
}

export default class CalendarManager extends React.Component {
  constructor() {
    super()

    this.state = {
      showEditor: false,    // flag to open editor
      selectInfo: null,     // fullcalendar selector
      currentEvents: INITIAL_EVENTS
    }

    this.handleOnClose = this.handleOnClose.bind(this)
    this.handleEventRemove = this.handleEventRemove.bind(this)
    this.handleEventCopy = this.handleEventCopy.bind(this)
  }

  handleOnClose() {
    this.setState({
      showEditor: false
    })
  }

  handleDateSelect = (selectInfo) => {
    this.setState({
      showEditor: true,
      selectInfo: selectInfo
    })
  }

  handleEventSave = (event) => {
    // if id given, update event otherwise create new one
    if(event.id) {
      this.state.selectInfo.event.setProp("title", event.title)
      this.state.selectInfo.event.setDates(event.start)
      this.state.selectInfo.event.setAllDay(event.allDay)
      this.state.selectInfo.event.setEnd(event.end)

      console.log(event)
      console.log(this.state.selectInfo.event)
    } 
    else {
      event.id = createEventId()
      this.state.selectInfo.view.calendar.addEvent(event)
    }

    this.setState({
      showEditor: false
    })
  }

  handleEventCopy = (event) => {
    // create a new event
    event.id = createEventId()
    this.state.selectInfo.view.calendar.addEvent(event)

    this.setState({
      showEditor: false
    })
  }

  handleEventClick = (clickInfo) => {
    this.setState({
      showEditor: true,
      selectInfo: clickInfo
    })
  }

  handleEventRemove() {
    if (window.confirm(`Are you sure you want to delete the event '${this.state.selectInfo.event.title}'`)) {
      this.state.selectInfo.event.remove()

      this.setState({
        showEditor: false
      })
    }
  }

  handleEvents = (events) => {
    // when dragging an all day event to a timed event there is no end set by fullcalendar
    // this had to be manually fixed
    let eventsNoEnd = events.filter(event => !event.allDay && !event.end)
    eventsNoEnd.forEach(event => {
      event.setEnd(event._instance.range.end)
    })

    this.setState({
      currentEvents: events
    })
  }

  renderEventContent(eventInfo) {
    return (
      <>
        {eventInfo.timeText && (
          <b>{eventInfo.timeText} - </b>
        )}
        <i>{eventInfo.event.title}</i>
      </>
    )
  }

  renderSidebar() {
    return (
      <div className='calendar-manager-sidebar'>
        <div className='calendar-manager-sidebar-section'>
          <h2>Date range</h2>
          <p> Only dates can be seleceted between { START_DATE } - { END_DATE }</p>
        </div>
        <div className='calendar-manager-sidebar-section'>
          <h2>All Events ({this.state.currentEvents.length})</h2>
          <ul>
            {this.state.currentEvents.map(this.renderSidebarEvent)}
          </ul>
        </div>
      </div>
    )
  }
  
  renderSidebarEvent(event) {
    return (
      <li key={event.id}>
        <i>{event.title} - </i>
        <b>
          {event.start && (
            event.start.toString()
           )} 
        </b>
        - 
        <b>
           {event.end && (
             event.end.toString()
           )}        
        </b>       
      </li>
    )
  }

  render() {
    return (
      <div className='calendar-manager'>
        {this.renderSidebar()}

        <div className='calendar-manager-main'>
          {this.state.showEditor && (
            /* Show editor based on flag*/
            <EventEditor 
              onSave={this.handleEventSave} 
              onDelete={this.handleEventRemove} 
              onClose={this.handleOnClose} 
              onCopy={this.handleEventCopy} 
              selectInfo={this.state.selectInfo}/> 
            )
          }

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            themeSystem="bootstrap"
            locale="DE"
            firstDay={1}  // set to mondy 1
            validRange={{ start: START_DATE, end: END_DATE }}
            initialView='timeGridWeek'
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={false}
            initialEvents={this.state.currentEvents}
            select={this.handleDateSelect}
            eventContent={this.renderEventContent} // custom render function
            eventClick={this.handleEventClick}
            eventsSet={this.handleEvents} // called after events are initialized/added/changed/removed
          />
        </div>
      </div>
    )
  }
}