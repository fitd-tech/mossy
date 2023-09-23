import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { map, size, find } from 'lodash'

import { mossyBackendDevUrl } from './constants';

export default function App() {
  const [buttonLabel, setButtonLabel] = useState('loading...')
  const [highlightButton, setHighlightButton] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [tasks, setTasks] = useState([])
  const [name, setName] = useState(null)
  const [frequency, setFrequency] = useState(null)
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

  useEffect(() => {
    if (highlightButton) {
      console.log(`find(tasks, ['_id.$oid', highlightButton])`, find(tasks, ['_id.$oid', highlightButton]))
      const selectedTaskName = find(tasks, ['_id.$oid', highlightButton]).name
      const selectedTaskFrequency = find(tasks, ['_id.$oid', highlightButton]).frequency
      setName(selectedTaskName)
      setFrequency(String(selectedTaskFrequency))
    }
  }, [highlightButton])

  function handleTaskCardPress(id) {
    setHighlightButton(id)
    setIsModalVisible(true)
  }

  function handleCreateTask() {
    console.log('called handleCreateTask')
    async function postTask() {
      console.log('called postTask')
      const taskData = {
        name,
        frequency: frequency ? Number(frequency) : 0,
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

  function handleSaveTask() {
    console.log('called handleSaveTask')
    async function saveTask() {
      console.log('called saveTask')
      const task = {
        _id: highlightButton,
        name,
        frequency: frequency ? Number(frequency) : 0,
      }
      const config = {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(task),
      }
      let result
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config)
        const serializedUpdateTaskResponse = await response.json()
        console.log('serializedUpdateTaskResponse', serializedUpdateTaskResponse)
        result = serializedUpdateTaskResponse
        fetchTasks()
      } catch (err) {
        console.log('err', err)
        result = err.message
      }
    }
    saveTask()
  }

  function handleCreate() {
    setIsModalVisible(true)
    setName('')
    setFrequency('')
  }

  function handleCloseModal() {
    setHighlightButton(null)
    setIsModalVisible(false)
  }

  function handleSave() {
    if (highlightButton) {
      handleSaveTask()
    } else {
      handleCreateTask()
    }
    handleCloseModal()
  }

  function handleDelete() {
    handleDeleteTasks()
    handleCloseModal()
  }

  function handleLogTasks() {
    async function getTaskList() {
      const result = await fetchTasks()
      console.log('result', result)
    }
    getTaskList()
  }

  function handleChangeField(value, setFunc) {
    setFunc(value)
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
          <View style={styles.createButtonWrapper}>
            <Button title="Make a task" onPress={handleCreate} />
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
            <Text style={styles.modalText}>Edit Task</Text>
            <TextInput 
              value={name}
              onChangeText={value => handleChangeField(value, setName)}
              placeholder="Name"
              style={styles.textInput}
            />
            <TextInput 
              value={frequency}
              onChangeText={value => handleChangeField(value, setFrequency)}
              placeholder="Frequency"
              inputMode="numeric"
              style={styles.textInput}
            />
            <Pressable
              style={styles.modalButton}
              onPress={handleSave}>
              <Text style={styles.textStyle}>Save</Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={handleDelete}>
              <Text style={styles.textStyle}>Delete</Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={handleCloseModal}>
              <Text style={styles.textStyle}>Cancel</Text>
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
  },
  textInput: {
    borderBottomWidth: 1,
    width: 200,
    height: 30,
    marginBottom: 25,
  },
  modalButton: {
    marginBottom: 15,
  },
  createButtonWrapper: {
    marginTop: 25,
  },
});
