import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable } from 'react-native';
import { map } from 'lodash'

import { mossyBackendDevUrl } from './constants';

const tasksMock = [
  {
    id: 1,
    name: 'Dishes',
    frequency: 1,
  },
  {
    id: 2,
    name: 'Clean pet fountain',
    frequency: 7,
  },
  {
    id: 3,
    name: 'Pet Lady',
    frequency: 1,
  },
  {
    id: 4,
    name: 'Laundry',
    frequency: 3,
  },
]

export default function App() {
  const [buttonLabel, setButtonLabel] = useState('loading...')
  const [highlightButton, setHighlightButton] = useState(null)
  console.log('highlightButton', highlightButton)

  async function fetchTasks() {
    console.log('called fetchTasks')
    const config = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      }
    }
    let result
    try {
      const response = await fetch(`http://${mossyBackendDevUrl}/api/tasks`, config)
      const serializedTasksResponse = await response.json()
      console.log('serializedTasksResponse', serializedTasksResponse)
      result = serializedTasksResponse
    } catch (err) {
      console.log('err', err)
      result = err.message
    }
  }

  useEffect(() => {
    async function fetchBooks() {
      const config = {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      }
      let result
      try {
        const response = await fetch(`http://${mossyBackendDevUrl}/api/books`, config)
        const serializedBooksResponse = await response.json()
        console.log('serializedBooksResponse', serializedBooksResponse)
        result = serializedBooksResponse.author
      } catch (err) {
        console.log('err', err)
        result = err.message
      }
      setButtonLabel(result)
    }
    fetchBooks()
    fetchTasks()
  }, [])

  function handleButtonPress() {
    if (buttonLabel === 'press me again') {
      setButtonLabel('i done been pressed')
    } else {
      setButtonLabel('press me again')
    }
  }

  function handleTaskCardPress(id) {
    console.log('id', id)
    setHighlightButton(id)
  }

  function handleCreateTask() {
    console.log('called handleCreateTask')
    async function postTask() {
      console.log('called postTask')
      const taskData = {
        name: 'new task',
        frequency: 2,
      }
      const config = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData),
      }
      let result
      try {
        const response = await fetch(`http://${mossyBackendDevUrl}/api/tasks`, config)
        const serializedCreateTaskResponse = await response.json()
        console.log('serializedCreateTaskResponse', serializedCreateTaskResponse)
        result = serializedCreateTaskResponse
        fetchTasks()
      } catch (err) {
        console.log('err', err)
        result = err.message
      }
    }
    postTask()
  }

  return (
    <View style={styles.container}>
      <Text>mossy</Text>
      <View style={styles.taskCardContainer}>
        {map(tasksMock, task => highlightButton === task.id ? (
          <Pressable onPress={() => handleTaskCardPress(task.id)} key={task.id}>
          <View style={styles.taskCardHighlighted}>
            <Text style={styles.taskTitleHighlighted}>{task.name}</Text>
            <Text style={styles.taskFrequencyHighlighted}>{`${task.frequency} Day(s)`}</Text>
          </View>
        </Pressable>
        ) : (
          <Pressable onPress={() => handleTaskCardPress(task.id)} key={task.id}>
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.name}</Text>
              <Text style={styles.taskFrequency}>{`${task.frequency} Day(s)`}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      <View>
        <Button title="Make a task" onPress={handleCreateTask} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCardContainer: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    justifyContent: 'center',
  },
  taskCard: {
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 30,
    fontWeight: 700,
  },
  taskFrequency: {
    fontSize: 15,
    color: 'darkgrey',
    fontWeight: 600,
  },
  taskCardHighlighted: {
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: 'mediumvioletred',
  },
  taskTitleHighlighted: {
    fontSize: 30,
    fontWeight: 700,
    color: 'white',
  },
  taskFrequencyHighlighted: {
    fontSize: 15,
    color: 'white',
    fontWeight: 600,
  }
});
