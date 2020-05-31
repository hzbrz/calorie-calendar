import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import '../Calendar/Calendar.css';

// let months = [
//   "January", "February", "March", "April", "May", "June", "July", "August",
//   "September", "October", "November", "December"
// ]

// //'July 20, 69 00:20:18'
// let today = new Date();

class Calendar extends Component {

  state = {
    generated: false,
    month_name: "",
    month_name_one: "",
    month_name_two: "",
    "January": {},
    "February": {},
    "March": {},
    "April": {},
    "May": {},
    "June": {},
    "July": {},
    "August": {},
    "September": {},
    "October": {},
    "November": {},
    "December": {}
  };

  nextPath = (path, state) => {
    this.props.history.push(path, state);
  }

  componentDidMount = () => {
    console.log(this.props)
    if (this.props.location.state === undefined) { this.nextPath("/") }
    else {
      fetch("https://carb-api.herokuapp.com/calorie/" +  this.props.location.state.calendar_id + "/" + this.props.location.state.calorie_id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          calorie: this.props.location.state.calorie,
        })
      }).then(res => {
        console.log("STAUTS", res.status)
        if (res.status === 422) {
          throw new Error(
            "Validation failed."
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Cannot mark calendar!');
        }
        return res.json();
      })
      .then(resData => {
        console.log("message: ", resData.error)
        // this statement runs if there is no data found in the db
        if(resData.message === "Calorie calendar not found!") { this.nextPath("/") }

        fetch("https://carb-api.herokuapp.com/calendar/" + this.props.location.state.calendar_id, {
          method: "GET"
        }).then(res => {
          if (res.status === 422) {
            throw new Error(
              "Validation failed."
            );
          }
          if (res.status !== 200 && res.status !== 201) {
            console.error('Getting Calendar failed!');
          }
          return res.json()
        })
          .then(calendarData => {
            let calendar_arr = []
            for (let i = 0; i < calendarData.Calendar.length; i++) {
              Object.entries(calendarData.Calendar[i][0]).forEach(([k, v]) => {
                calendar_arr.push(k, v)
              })
            }
            // console.log(calendar_arr)
            this.setState({
              [calendar_arr[0]]: calendar_arr[1],
              [calendar_arr[2]]: calendar_arr[3],
              [calendar_arr[4]]: calendar_arr[5],
              generated: true,
              month_name : calendar_arr[0],
              month_name_one: calendar_arr[2],
              month_name_two: calendar_arr[4]
            });
          })
          .catch(err => console.log("GET fetch", err))
          
      }).catch(err => console.log("MARK CALENDAR GET", err))
    }
  }

  // first the arg that we passed and then the react event gets passed, thus the order
  clickHandler(month, day_number, event) {
    let day = event.currentTarget.textContent
    // console.log(day)
    // checking if the day is marked, if not we POST and mark the day else we PUT and unmark
    if (day !== "X") {
      fetch("https://carb-api.herokuapp.com/calendar/" + this.props.location.state.calendar_id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // this is the request body that will be passed into the server 
        body: JSON.stringify({
          month: month,
          day: day,
        })
      }).then(res => {
        if (res.status === 422) {
          throw new Error(
            "Validation failed."
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Cannot mark calendar!');
        }
        return res.json();
      })
        .then(resData => {
          // console.log(resData)
          console.log(resData.message)
          this.setState({ [month]: resData.update })
        })
        .catch(err => console.log("resData error", err))
    } else {
      fetch("https://carb-api.herokuapp.com/calendar/" + this.props.location.state.calendar_id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        // day_number keeps track of the number after it has changed to "X"
        body: JSON.stringify({
          month: month,
          day: day_number,
        })
      }).then(res => {
        if (res.status === 422) {
          throw new Error(
            "Validation failed."
          );
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Cannot mark calendar!');
        }
        return res.json();
      })
        .then(resData => {
          console.log(resData.message)
          this.setState({ [month]: resData.update })
        })
        .catch(err => console.log("resData error", err))
    }
  }

  // debug method to drop the collections and test out the serve/client persistance/connection
  // dropCollection = () => {
  //   fetch("https://carb-api.herokuapp.com/drop", {
  //     method: "GET"
  //   }).then(res => {
  //     return res.json()
  //   })
  //     .then(resData => {
  //       console.log(resData);
  //     })
  // }


  render() {
    const { month_name, month_name_one, month_name_two } = this.state;
    let month = this.state[month_name];
    let month_one = this.state[month_name_one];
    let month_two = this.state[month_name_two];

    return (
      <div className="parentDiv">
        {
          this.state.generated ?
            <div>
              <h1>GOAL CALENDAR</h1>
              <h4>GOAL CAL: {this.props.location.state.calorie}</h4>
              {/* <button onClick={this.dropCollection}>Debug: drop collection</button> */}
              <br />
              <br />

              <div className="floating-table">
                <table>
                  <tbody>
                    <caption className="captionStyle">{month_name}</caption>
                    <tr>
                      {/* With an arrow function, we have to pass the react event explicitly, 
                      but with bind any further arguments are automatically forwarded, along with the arg that we want to pass. */}
                      {
                      month[0] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "0")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "0")}>{month[0]}</td>
                      } 
                      {
                      month[1] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "1")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "1")}>{month[1]}</td>
                      }
                      {
                      month[2] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "2")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "2")}>{month[2]}</td>
                      }
                      {
                      month[3] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "3")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "3")}>{month[3]}</td>
                      }
                      {
                      month[4] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "4")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "4")}>{month[4]}</td>
                      }
                      {
                      month[5] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "5")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "5")}>{month[5]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month[6] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "6")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "6")}>{month[6]}</td>
                      } 
                      {
                      month[7] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "7")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "7")}>{month[7]}</td>
                      }
                      {
                      month[8] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "8")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "8")}>{month[8]}</td>
                      }
                      {
                      month[9] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "9")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "9")}>{month[9]}</td>
                      }
                      {
                      month[10] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "10")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "10")}>{month[10]}</td>
                      }
                      {
                      month[11] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "11")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "11")}>{month[11]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month[12] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "12")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "12")}>{month[12]}</td>
                      } 
                      {
                      month[13] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "13")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "13")}>{month[13]}</td>
                      }
                      {
                      month[14] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "14")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "14")}>{month[14]}</td>
                      }
                      {
                      month[15] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "15")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "15")}>{month[15]}</td>
                      }
                      {
                      month[16] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "16")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "16")}>{month[16]}</td>
                      }
                      {
                      month[17] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "17")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "17")}>{month[17]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month[18] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "18")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "18")}>{month[18]}</td>
                      } 
                      {
                      month[19] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "19")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "19")}>{month[19]}</td>
                      }
                      {
                      month[20] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "20")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "20")}>{month[20]}</td>
                      }
                      {
                      month[21] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "21")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "21")}>{month[21]}</td>
                      }
                      {
                      month[22] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "22")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "22")}>{month[22]}</td>
                      }
                      {
                      month[23] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "23")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "23")}>{month[23]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month[24] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "24")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "24")}>{month[24]}</td>
                      } 
                      {
                      month[25] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "25")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "25")}>{month[25]}</td>
                      }
                      {
                      month[26] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "26")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "26")}>{month[26]}</td>
                      }
                      {
                      month[27] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "27")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "27")}>{month[27]}</td>
                      }
                      {
                      month[28] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "28")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "28")}>{month[28]}</td>
                      }
                      {
                      month[29] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name, "29")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name, "29")}>{month[29]}</td>
                      }
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="floating-table" id="middleTable">
                <table>
                  <tbody>
                    <caption className="captionStyle">{month_name_one}</caption>
                    <tr>
                    {
                      month_one[0] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "0")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "0")}>{month_one[0]}</td>
                      } 
                      {
                      month_one[1] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "1")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "1")}>{month_one[1]}</td>
                      }
                      {
                      month_one[2] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "2")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "2")}>{month_one[2]}</td>
                      }
                      {
                      month_one[3] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "3")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "3")}>{month_one[3]}</td>
                      }
                      {
                      month_one[4] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "4")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "4")}>{month_one[4]}</td>
                      }
                      {
                      month_one[5] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "5")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "5")}>{month_one[5]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_one[6] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "6")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "6")}>{month_one[6]}</td>
                      } 
                      {
                      month_one[7] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "7")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "7")}>{month_one[7]}</td>
                      }
                      {
                      month_one[8] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "8")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "8")}>{month_one[8]}</td>
                      }
                      {
                      month_one[9] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "9")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "9")}>{month_one[9]}</td>
                      }
                      {
                      month_one[10] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "10")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "10")}>{month_one[10]}</td>
                      }
                      {
                      month_one[11] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "11")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "11")}>{month_one[11]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_one[12] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "12")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "12")}>{month_one[12]}</td>
                      } 
                      {
                      month_one[13] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "13")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "13")}>{month_one[13]}</td>
                      }
                      {
                      month_one[14] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "14")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "14")}>{month_one[14]}</td>
                      }
                      {
                      month_one[15] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "15")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "15")}>{month_one[15]}</td>
                      }
                      {
                      month_one[16] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "16")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "16")}>{month_one[16]}</td>
                      }
                      {
                      month_one[17] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "17")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "17")}>{month_one[17]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_one[18] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "18")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "18")}>{month_one[18]}</td>
                      } 
                      {
                      month_one[19] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "19")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "19")}>{month_one[19]}</td>
                      }
                      {
                      month_one[20] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "20")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "20")}>{month_one[20]}</td>
                      }
                      {
                      month_one[21] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "21")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "21")}>{month_one[21]}</td>
                      }
                      {
                      month_one[22] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "22")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "22")}>{month_one[22]}</td>
                      }
                      {
                      month_one[23] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "23")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "23")}>{month_one[23]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_one[24] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "24")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "24")}>{month_one[24]}</td>
                      } 
                      {
                      month_one[25] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "25")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "25")}>{month_one[25]}</td>
                      }
                      {
                      month_one[26] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "26")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "26")}>{month_one[26]}</td>
                      }
                      {
                      month_one[27] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "27")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "27")}>{month_one[27]}</td>
                      }
                      {
                      month_one[28] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "28")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "28")}>{month_one[28]}</td>
                      }
                      {
                      month_one[29] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_one, "29")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_one, "29")}>{month_one[29]}</td>
                      }
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="floating-table">
                <table>
                  <tbody>
                    <caption className="captionStyle">{month_name_two}</caption>
                    <tr>
                    {
                      month_two[0] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "0")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "0")}>{month_two[0]}</td>
                      } 
                      {
                      month_two[1] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "1")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "1")}>{month_two[1]}</td>
                      }
                      {
                      month_two[2] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "2")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "2")}>{month_two[2]}</td>
                      }
                      {
                      month_two[3] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "3")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "3")}>{month_two[3]}</td>
                      }
                      {
                      month_two[4] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "4")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "4")}>{month_two[4]}</td>
                      }
                      {
                      month_two[5] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "5")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "5")}>{month_two[5]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_two[6] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "6")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "6")}>{month_two[6]}</td>
                      } 
                      {
                      month_two[7] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "7")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "7")}>{month_two[7]}</td>
                      }
                      {
                      month_two[8] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "8")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "8")}>{month_two[8]}</td>
                      }
                      {
                      month_two[9] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "9")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "9")}>{month_two[9]}</td>
                      }
                      {
                      month_two[10] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "10")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "10")}>{month_two[10]}</td>
                      }
                      {
                      month_two[11] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "11")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "11")}>{month_two[11]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_two[12] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "12")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "12")}>{month_two[12]}</td>
                      } 
                      {
                      month_two[13] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "13")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "13")}>{month_two[13]}</td>
                      }
                      {
                      month_two[14] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "14")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "14")}>{month_two[14]}</td>
                      }
                      {
                      month_two[15] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "15")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "15")}>{month_two[15]}</td>
                      }
                      {
                      month_two[16] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "16")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "16")}>{month_two[16]}</td>
                      }
                      {
                      month_two[17] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "17")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "17")}>{month_two[17]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_two[18] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "18")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "18")}>{month_two[18]}</td>
                      } 
                      {
                      month_two[19] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "19")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "19")}>{month_two[19]}</td>
                      }
                      {
                      month_two[20] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "20")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "20")}>{month_two[20]}</td>
                      }
                      {
                      month_two[21] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "21")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "21")}>{month_two[21]}</td>
                      }
                      {
                      month_two[22] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "22")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "22")}>{month_two[22]}</td>
                      }
                      {
                      month_two[23] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "23")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "23")}>{month_two[23]}</td>
                      }
                    </tr>
                    <tr>
                    {
                      month_two[24] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "24")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "24")}>{month_two[24]}</td>
                      } 
                      {
                      month_two[25] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "25")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "25")}>{month_two[25]}</td>
                      }
                      {
                      month_two[26] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "26")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "26")}>{month_two[26]}</td>
                      }
                      {
                      month_two[27] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "27")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "27")}>{month_two[27]}</td>
                      }
                      {
                      month_two[28] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "28")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "28")}>{month_two[28]}</td>
                      }
                      {
                      month_two[29] === "X" ? 
                        <td className="xStyle" onClick={this.clickHandler.bind(this, month_name_two, "29")}>X</td> : 
                        <td className="tdDefaultStyle" onClick={this.clickHandler.bind(this, month_name_two, "29")}>{month_two[29]}</td>
                      }
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
            :
            <div>
              {/* <h1>START BY GENERATING YOUR GOAL CALENADR</h1>
              <button onClick={this.generateCalendar}>Generate Calendar</button> */}
              <br />
              {/* <button onClick={this.dropCollection}>Debug: drop collection</button> */}
              <br />
              <h2>Loading...</h2>
            </div>
        }

      </div>
    )
  };
}

export default withRouter(Calendar);
