//state array passed as props
//maps through array to render individual task component
import React from 'react';
import Task from './Task.jsx';

function Tasks({tasks, openModal, isMobile, deleteTask}) {
  // console.log('tasks in tasks', tasks)
  return(
    tasks.map((task, i) => {
    return (<Task style={{display: 'inline-block'}}
    key={i} task={task} openModal={openModal} isMobile={isMobile}
    deleteTask={deleteTask}/>)
    }
  )
  )
}

export default Tasks;
