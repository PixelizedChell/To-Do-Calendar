import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import MyCalendar from './calendar/MyCalendar.jsx';
import ToDoList from './to-do-list/ToDoList.jsx';
import TopBar from './TopBar.jsx';
import moment from 'moment';

// For example data:
import { result } from '../../../database/example.js';

const Home = ({ setIsLoading, isMobile, isLoggedIn, isLoading, setIsLoggedIn, sharedBy }) => {

  const [allTodos, setAllTodos] = useState([]);
  const [myEvents, setMyEvents] = useState(result.calendars[0].categories);
  const [onCalendar, setOnCalendar] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState()

  // Data present in 'a@a.com
  const [userEmail, setEmail] = useState(null);
  const [hasData, setHasData] = useState(false)

  const navigate = useNavigate()

  useEffect(async () => {
    await axios.get('http://localhost:3000/auth/isLoggedIn', { withCredentials: true })
      .then(async (result) => {
        console.log('result', result)
        setIsLoading(false);
        if (result.data) {
          setIsLoggedIn(result.data.loggedIn);
          setEmail(result.data.info)
          await axios.get('http://localhost:3000/todoList/info', { params: { email: result.data.info } })
            .then((response) => {
              setMyEvents(response.data.results[0].calendars[0].categories)
            })
            .then(() => setHasData(true))
            .catch((err) => {
              console.log('info err:', err);
              return err;
            })
        }
      })
      .catch((err) => {
        console.log(err);
        return err;
      })
  }, [isLoggedIn])

  // API Request Routes:
  //
  // GET '/todoList/:userEmail' -> For all data
  const getAllTodos = (user) => {
    console.log('Get All Todo Data');
    // axios.get('/todoList', { params: { userEmail: userEmail } })
    //   .then((result) => {
    //       console.log(result);
    //       setAllTodos(result);
    //     })
    //     .catch(err => console.error(err));
  }

  // POST '/todoList/:userEmail' -> Adding or Upserting a "todoList item"
  //modified to use actual user email
  const addTodo = (todo) => {
    console.log('Add todo: ', todo);
    const incomingEmail = info.user_email;
    axios.post('http://localhost:3000/todoList/item', { params: { userEmail: incomingEmail }, data: todo })
      .then((result) => {
        console.log(result);
        let catId = result.data.id;
        console.log('all todos before: ', myEvents);
        let newTask = { item_id: catId, title: todo.title, description: todo.description, duration: todo.duration, start: todo.start, end_time: todo.end_date, in_calendar: todo.in_calendar };
        // let newEventsList = myEvents[0];
        // newEventsList.push(newCat);
        // setMyEvents(newEventsList);
        console.log('all todos after: ', myEvents);
      })
      .catch(err => console.error(err));
  }


  // PATCH '/todoList/:userEmail' -> For updating the data -> ex. Moving around item in Calendar / Lengthening item in Calendar / Clicking on "Done" in Modal for Calendar/TodoList
  const updateTodo = (todo) => {

    console.log('Update Todo: ', todo);
    // axios.patch('/todoList', { params: { userEmail: userEmail }, data: todo })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch(err => console.error(err));
  }

  // DELETE '/todoList/:userEmail' -> For deleting the data -> Clicking on "Delete" button in Modal
  const deleteTodo = (todo) => {
    console.log('Delete Todo: ', todo);
    // axios.delete('/todoList', { params: { userEmail: userEmail }, data: todo })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch(err => console.error(err));
  }

  const addCategory = (category) => {

    let incomingId;

    if (info.length > 0) {
      incomingId = info.calendars[0].calendar_id;
    } else {
      incomingId = 11;
    }

    axios.post('http://localhost:3000/todoList/category', { params: { calendar_id: incomingId, category: category } })
      .then((result) => {
        console.log('cat post result: ', result);
        let catId = result.data.category_id;
        let newCat = { category_id: catId, category: category, todoitems: [] };
        let newEventsList = myEvents[0];
        newEventsList.push(newCat);
        setMyEvents(newEventsList);
        console.log('new event list: ', myEvents);
      })
      .catch(err => console.error(err));
  }

  // For example data / demo landing page if not logged in

  // if (isLoggedIn === false) {}


  // For getting all data when rendering
  // useEffect(() => {
  //   getAllTodos();
  // })
  //Calendar helper functions
  const moveEvent = useCallback(
    ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
      if (isLoggedIn === false) {
        navigate('/signin')
      } else {
        const { allDay } = event;
        if (!allDay && droppedOnAllDaySlot) {
          event.allDay = true;
        }
        setMyEvents((prev) => {
          const existing = event;
          const list = prev
          list.forEach(category => {
            category.items.filter(item => {
              if (item === existing) {
                item.start = start;
                item.end_date = end;
              }
            })
          })
          return list;
        });
      }
      // setMyEvents((prev) => {
      //   const existing = prev.find((ev) => ev.id === event.id) ?? {};
      //   const filtered = prev.filter((ev) => ev.id !== event.id);
      //   return [...filtered, { ...existing, start, end, allDay }];
      // });
    },
    [setMyEvents]
  );

  const newEvent = useCallback(
    (event) => {
      setMyEvents((prev) => {
        const idList = prev.map((item) => item.id)
        const newId = Math.max(...idList) + 1
        return [...prev, { ...event, id: newId }]
      })
    },
    [setMyEvents]
  )

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      if (isLoggedIn === false) {
        navigate('/signin')
      } else {
        setMyEvents((prev) => {
          const existing = event;
          const list = prev
          list.forEach(category => {
            category.items.forEach(item => {
              if (item === existing) {
                item.start = start;
                item.end_date = end;
              }
            })
          })
          return list;
        });
      }
    },
    [setMyEvents]
  );

  const changeTitle = (event) => {
    if (isLoggedIn === false) {
      navigate('/signin')
    } else {
      var title = prompt("Change title", event.title);
      setMyEvents((prev) => {
        const existing = event;
        const list = prev
        list.forEach(category => {
          category.items.forEach(item => {
            if (item === existing) {
              item.title = title;
            }
          })
        })
        return list;
      })
    }
  };

  const handleDragStart = useCallback((event) => {
    if (isLoggedIn === false) {
      navigate('/signin')
    } else {
      setDraggedEvent(event), []
    }
  })

  const onDropFromOutside = useCallback(
    () => {
      setMyEvents((prev) => {
        const existing = draggedEvent;
        const list = prev
        list.forEach(category => {
          category.items.forEach(item => {
            if (item === existing) {
              item.in_calendar = !item.in_calendar
            }
          })
        })
        return list;
      });
      setDraggedEvent(null)
    },
    [draggedEvent, setDraggedEvent, newEvent]
  )
  // All Components
  const naviBar = (<TopBar isLoading={isLoading} setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} isMobile={isMobile} onCalendar={onCalendar} setOnCalendar={setOnCalendar} userEmail={userEmail}/>);
  const toDoList = (<ToDoList isMobile={isMobile} taskData={myEvents.flat()}
  draggedEvent={draggedEvent} setDraggedEvent={setDraggedEvent} handleDragStart={handleDragStart} addCategory={addCategory} addTodo={addTodo}
  info={myEvents} />);
  const myCalendar = (<MyCalendar myEvents={myEvents} moveEvent={moveEvent} resizeEvent={resizeEvent} changeTitle={changeTitle} onDropFromOutside={onDropFromOutside}/>);

  // Conditional Rendering based on device
  const renderContent = () => {

    // view for mobile and in to do list page
    if (isMobile && !onCalendar) {
      return (
        <div>
          {naviBar}
          <div className="">
            {myEvents.length ? toDoList : null}
          </div>
        </div>
      )
    } else if (isMobile && onCalendar) {
      // view for mobile and in calendar page
      return (
        <div>
          {naviBar}
          <div>
            {myEvents.length ? myCalendar : null}
          </div>
        </div>
      )
    } else {
      return (
        // view for desktop display both calendar and to do list
        <div>
          {naviBar}
          {myCalendar}
          {myEvents.length ? toDoList : null}
        </div>
      )
    }
  }

  return (
    <div>
      {renderContent()}
    </div>
  )
}

export default Home;
