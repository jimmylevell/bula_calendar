import React, { Component } from 'react';
import {
  TextField,
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  FormControl, 
  InputLabel, 
  Select,
  MenuItem,
  FormHelperText
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
  },
  inputField: {
    marginTop: theme.spacing(1)
  }
});
const places = ["Under de Brugg", "Ähned am Bergli"]
const languages = ["German", "French", "Italian", "Schwitzerdütsch"]

function convertDateToIso(date) {
    return moment(date).toISOString(true).substring(0, 16)
}

class EventEditor extends Component {
  constructor() {
    super();
    this.state = {
      calendar: null,

      dateTimeSelector: "",
      evnt: { title: "", 
              start: "", 
              end: "", 
              allDay: false,
              amountParticipants: 0,
              place: "",
              language: ""
            },

      errorText: ""
    };
  }

  componentDidMount() {
    const { selectInfo } = this.props
    
    // if event is passed or only select for new event
    if(selectInfo.event) {
      let event = selectInfo.event.toPlainObject()

      event.allDay = selectInfo.event.allDay
      event.start = convertDateToIso(event.start)
      event.end = convertDateToIso(event.end)

      this.setState({
        calendar: selectInfo.view.calendar,
        evnt: event,
        dateTimeSelector: "datetime-local"
      })
    }
    else {
      let event = this.state.evnt
      event.start = convertDateToIso(selectInfo.start);
      event.end = convertDateToIso(selectInfo.end);
      event.allDay = selectInfo.allDay;

      this.setState({
        calendar: selectInfo.view.calendar,
        evnt: event,
        dateTimeSelector: "datetime-local"
      })
    }   
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
                key="inputStartTime"
                name="start"
                label="Start time"
                type={this.state.dateTimeSelector}
                value={this.state.evnt.start}
                onChange={this.handleChange}
                className={classes.inputField}
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
                className={classes.inputField}
              />

              <TextField
                required 
                type="number"
                key="inputAmountParticipants"
                name="amountParticipants"
                placeholder="100"
                label="Amount Participants"
                value={this.state.evnt.amountParticipants}
                onChange={this.handleChange}
                className={classes.inputField}
              />
      
              <InputLabel id="labelInputPlace">Place</InputLabel>
              <Select
                labelId="labelInputPlace"
                id="inputPlace"
                value={this.state.place}
                onChange={this.handleChange}
                autoWidth
              >
                {
                  places.map((place, i) => (
                    <MenuItem keys={i} value={place}><em>{place}</em></MenuItem>
                  ))
                }
              </Select>

              <InputLabel id="labelInputLanguage">Language</InputLabel>
              <Select
                labelId="labelInputLanguage"
                id="inputLanguage"
                value={this.state.language}
                onChange={this.handleChange}
                autoWidth
              >
                {
                  languages.map((language, i) => (
                    <MenuItem keys={i} value={language}><em>{language}</em></MenuItem>
                  ))
                }
              </Select>
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