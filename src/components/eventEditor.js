import React, { Component } from 'react';
import {
  TextField,
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  Switch,
  FormControlLabel,
  FormGroup
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import ClearIcon from '@material-ui/icons/Clear';
import CopyIcon from '@material-ui/icons/FileCopy'
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';

import moment from 'moment';
import 'moment-timezone';

const styles = theme => ({
  modal: {
    display: 'flex',
    outline: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: "100%"
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(2),
  }
});

// function which returns either the datetime or only date based on if the event is a allday or not
function convertDateToIso(allDay, date) {
  if(allDay) {
    // all day event require only the date
    return moment(date).toISOString(true).substring(0, 10)
  } else {
    return moment(date).toISOString(true).substring(0, 16)
  }
}

class EventEditor extends Component {
  constructor() {
    super();
    this.state = {
      calendar: null,

      dateTimeSelector: "",
      evnt: { title: "", start: "", end: "", allDay: false},

      errorText: ""
    };

    this.toggleAllDayEvent = this.toggleAllDayEvent.bind(this)
  }

  componentDidMount() {
    const { selectInfo } = this.props
    
    // if event is passed or only select for new event
    if(selectInfo.event) {
      let event = selectInfo.event.toPlainObject()

      event.allDay = selectInfo.event.allDay
      event.start = convertDateToIso(event.allDay, event.start)
      event.end = convertDateToIso(event.allDay, event.end)

      this.setState({
        calendar: selectInfo.view.calendar,
        evnt: event,
        dateTimeSelector: this.getDateTimeSelector(event.allDay)
      })
    }
    else {
      this.setState({
        calendar: selectInfo.view.calendar,
        evnt: {
          title: "", 
          start: convertDateToIso(selectInfo.allDay, selectInfo.start),
          end: convertDateToIso(selectInfo.allDay, selectInfo.end),
          allDay: selectInfo.allDay
        }, 
        dateTimeSelector: this.getDateTimeSelector(selectInfo.allDay)
      })
    }   
  }

  // return the correct input form based on if event is all day
  getDateTimeSelector(allDayEvent) {
    if(allDayEvent) {
      return "date"
    } else {
      return "datetime-local"
    }
  }

  // switch between time based and all day event
  toggleAllDayEvent() {
    let event = this.state.evnt

    event.allDay = !event.allDay
    event.start = convertDateToIso(event.allDay, event.start)
    event.end = convertDateToIso(event.allDay, event.end)

    // when changing from a all day event to a timed event you need to add +1 hour at event end
    // otherwise new event has start and end hour 00:00 
    let time = event.end.toString().split("T")
    let slice = time[0].split("-")
    if(event.allDay) {
      event.end = slice[0] + "-" + slice[1] + "-0" + ++slice[2]
    } else {
      event.end = slice[0] + "-" + slice[1] + "-0" + --slice[2] + "T01:00"
    }

    this.setState({
      dateTimeSelector: this.getDateTimeSelector(event.allDay),
      evnt: event
    })
  }

  checkIfEventsOverLap(event) {
    // check if the new event is overlapping with a blocked one
    let blockingEvents = this.state.calendar.getEvents().filter(event => event.overlap === false)
    let notAllowedOverlap = false
    blockingEvents.forEach(blockingEvent => {
      if((new Date(event.start) > new Date(blockingEvent.start) && new Date(event.start) < new Date(blockingEvent.end)) ||
          (new Date(event.end) > new Date(blockingEvent.start) && new Date(event.end) < new Date(blockingEvent.end)))
      {
        notAllowedOverlap = true
      }
    })

    return notAllowedOverlap
  }

  handleChange = evt => {
    let event = this.state.evnt
    event[evt.target.name] = evt.target.value

    // check if the new event has a valid time period given, so that the start is not in front of the end time
    if(new Date(event.start) > new Date(event.end)) {
      this.setState({
        errorText: "Der Endzeitpunkt kann nicht hinter dem Startzeitpunkt liegen"
      })
    } else if(this.checkIfEventsOverLap(event)) {
      this.setState({
        errorText: "Der Event überlagert mit einem blockierenden Event"
      })
    } else {
      this.setState({
        evnt: event,
        errorText: ""
      })
    }
  }

  // function handling submit of form
  handleSubmit = evt => {
    evt.preventDefault();
    const { onSave } = this.props
    let event = this.state.evnt

    // trigger parent function passed by props
    onSave(event)
  };

  // handling copy of event
  handleCopy = evt => {
    const { onCopy } = this.props

    // trigger parent function passed by props
    onCopy(this.state.evnt)
  }

  render() {
    const { classes, onClose, onDelete} = this.props;

    return (
      <Modal
        className={classes.modal}
        onClose={onClose}
        open
      >
        <Card className={classes.modalCard}>
          <form onSubmit={this.handleSubmit}>
            <CardContent className={classes.modalCardContent}>
              <TextField
                required 
                type="text"
                key="inputTitle"
                name="title"
                placeholder="title"
                label="Event title"
                value={this.state.evnt.title}
                onChange={this.handleChange}
                variant="outlined"
                size="small"
              />
              <TextField
                key="inputStartTime"
                name="start"
                label="Start time"
                type={this.state.dateTimeSelector}
                value={this.state.evnt.start}
                onChange={this.handleChange}
              />
              <TextField
                key="inputEndTime"
                name="end"
                label="End time"
                type={this.state.dateTimeSelector}
                value={this.state.evnt.end}
                onChange={this.handleChange}
                error ={this.state.errorText.length === 0 ? false : true }
                helperText={this.state.errorText}
              />
              <FormGroup aria-label="position" row>
                <FormControlLabel
                  value="allDay"
                  control={<Switch 
                      size="small" 
                      checked={this.state.evnt.allDay} 
                      onChange={this.toggleAllDayEvent} 
                    />}
                  label="AllDay Event"
                  labelPlacement="top"
                />
              </FormGroup>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" type="submit"><SaveAltIcon/>Save</Button>
              <Button size="small" onClick={this.handleCopy}><CopyIcon/>Copy</Button>
              <Button size="small" onClick={onDelete}><DeleteIcon/>Delete</Button>
              <Button size="small" onClick={onClose}><ClearIcon/>Cancel</Button>
            </CardActions>
          </form>
        </Card>
    </Modal>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(EventEditor);