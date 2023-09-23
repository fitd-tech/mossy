import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable, ScrollView, Modal } from 'react-native';
import { map, size } from 'lodash'

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
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tasks, setTasks] = useState([])
  console.log('highlightButton', highlightButton)
  console.log('tasks', tasks)
  console.log('tasks?.[0]?._id.$oid', tasks?.[0]?._id.$oid)
  console.log('isModalVisible', isModalVisible)

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
      const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config)
      const serializedTasksResponse = await response.json()
      setTasks(serializedTasksResponse)
      console.log('serializedTasksResponse', serializedTasksResponse || [])
      result = serializedTasksResponse
    } catch (err) {
      console.log('err', err)
      result = err.message
    }
    return result
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
        const response = await fetch(`${mossyBackendDevUrl}api/books`, config)
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
    setIsModalVisible(true)
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
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config)
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

  function handleDeleteTasks() {
    console.log('called handleDeleteTasks')
    async function deleteTasks() {
      console.log('called deleteTask')
      const config = {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify([highlightButton]),
      }
      let result
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config)
        const serializedDeleteTasksResponse = await response.json()
        console.log('serializedDeleteTasksResponse', serializedDeleteTasksResponse)
        result = serializedDeleteTasksResponse
        fetchTasks()
      } catch (err) {
        console.log('err', err)
        result = err.message
      }
    }
    deleteTasks()
  }

  function handleCloseModal() {
    handleDeleteTasks()
    setHighlightButton(null)
    setIsModalVisible(false)
  }

  function handleLogTasks() {
    async function getTaskList() {
      const result = await fetchTasks()
      console.log('result', result)
    }
    getTaskList()
  }

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text>mossy</Text>
          <View style={styles.taskCardContainer}>
            {size(tasks) ? (
              <>
                {map(tasks, task => highlightButton === task._id.$oid ? (
                  <Pressable onPress={() => handleTaskCardPress(task._id.$oid)} key={task._id.$oid}>
                  <View style={styles.taskCardHighlighted}>
                    <Text style={styles.taskTitleHighlighted}>{task.name}</Text>
                    <Text style={styles.taskFrequencyHighlighted}>{`${task.frequency} Day(s)`}</Text>
                  </View>
                </Pressable>
                ) : (
                  <Pressable onPress={() => handleTaskCardPress(task._id.$oid)} key={task._id.$oid}>
                    <View style={styles.taskCard}>
                      <Text style={styles.taskTitle}>{task.name}</Text>
                      <Text style={styles.taskFrequency}>{`${task.frequency} Day(s)`}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Create some tasks!</Text>
              </View>
            )
            }
          </View>
          <View>
            <Button title="log task list" onPress={handleLogTasks} />
          </View>
          <View>
            <Button title="Make a task" onPress={handleCreateTask} />
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Options</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={handleCloseModal}>
              <Text style={styles.textStyle}>Delete, maybe?</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  placeholder: {
    marginTop: 100,
    marginBottom: 100,
  },
  placeholderText: {
    fontSize: 20,
  }
});
