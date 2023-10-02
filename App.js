import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { map, size, find, orderBy } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons'; 

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function App() {
  console.log("mossyBackendDevUrl", mossyBackendDevUrl);
  const [buttonLabel, setButtonLabel] = useState("loading...");
  const [highlightButton, setHighlightButton] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [formType, setFormType] = useState("task");
  const [completionDate, setCompletionDate] = useState(new Date());
  console.log("tasks", tasks);
  console.log("highlightButton", highlightButton);

  async function fetchTasks() {
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    let result;
    try {
      const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
      const serializedTasksResponse = await response.json();
      const tasksWithMoss = map(serializedTasksResponse, (task) => {
        const dateDifference = new Date() - new Date(task.latest_event_date);
        const daysDifference = Math.round(
          dateDifference / (1000 * 60 * 60 * 24),
        );
        return {
          ...task,
          daysSince: task.latest_event_date ? daysDifference : null,
          moss: task.latest_event_date ? daysDifference - task.frequency : null,
        };
      });
      const sortedTasksWithMoss = orderBy(tasksWithMoss, "moss", "desc");
      setTasks(sortedTasksWithMoss);
      result = serializedTasksResponse;
    } catch (err) {
      result = err.message;
    }
    return result;
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (highlightButton) {
      const selectedTaskName = find(tasks, ["_id.$oid", highlightButton]).name;
      const selectedTaskFrequency = find(tasks, [
        "_id.$oid",
        highlightButton,
      ]).frequency;
      setName(selectedTaskName);
      setFrequency(String(selectedTaskFrequency));
    }
  }, [highlightButton]);

  function handleTaskCardPress(id) {
    setHighlightButton(id);
    setIsModalVisible(true);
  }

  function handleCreateTask() {
    async function postTask() {
      const taskData = {
        name,
        frequency: frequency ? Number(frequency) : 0,
      };
      const config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedCreateTaskResponse = await response.json();
        result = serializedCreateTaskResponse;
        fetchTasks();
      } catch (err) {
        result = err.message;
      }
    }
    postTask();
  }

  function handleDeleteTasks() {
    async function deleteTasks() {
      const config = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([highlightButton]),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedDeleteTasksResponse = await response.json();
        result = serializedDeleteTasksResponse;
        fetchTasks();
      } catch (err) {
        result = err.message;
      }
    }
    deleteTasks();
  }

  function handleSaveTask() {
    async function saveTask() {
      const task = {
        _id: highlightButton,
        name,
        frequency: frequency ? Number(frequency) : 0,
      };
      const config = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedUpdateTaskResponse = await response.json();
        result = serializedUpdateTaskResponse;
        fetchTasks();
      } catch (err) {
        result = err.message;
      }
    }
    saveTask();
  }

  function handleCompleteTask() {
    async function completeTask() {
      const event = {
        task: highlightButton,
        date: completionDate,
      };
      const config = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedCreateEventResponse = await response.json();
        result = serializedCreateEventResponse;
        fetchTasks();
      } catch (err) {
        result = err.message;
      }
    }
    completeTask();
  }

  function handleCreate() {
    setIsModalVisible(true);
    setFormType("edit");
    setName("");
    setFrequency("");
  }

  function handleCloseModal() {
    setHighlightButton(null);
    setIsModalVisible(false);
    setFormType("task");
  }

  function handleEdit() {
    setFormType("edit");
  }

  function handleSave() {
    if (highlightButton) {
      handleSaveTask();
    } else {
      handleCreateTask();
    }
    handleCloseModal();
  }

  function handleComplete() {
    setFormType("event");
  }

  function handleSaveComplete() {
    handleCompleteTask();
    handleCloseModal();
  }

  function confirmDelete() {
    setFormType("delete");
  }

  function handleDelete() {
    handleDeleteTasks();
    handleCloseModal();
  }

  function handleChangeField(value, setFunc) {
    setFunc(value);
  }

  function handleChangeDate(e, date, setFunc) {
    if (e.type === "set") {
      setFunc(date);
    }
  }

  function renderForm() {
    if (formType === "edit") {
      return (
        <>
          <Text style={styles.modalTitle}>Edit Task</Text>
          <TextInput
            value={name}
            onChangeText={(value) => handleChangeField(value, setName)}
            placeholder="Name"
            style={styles.textInput}
          />
          <TextInput
            value={frequency}
            onChangeText={(value) => handleChangeField(value, setFrequency)}
            placeholder="Frequency"
            inputMode="numeric"
            style={styles.textInput}
          />
          <Pressable style={styles.modalButton} onPress={handleSave}>
            <Text style={styles.textStyle}>Save</Text>
          </Pressable>
        </>
      );
    }
    if (formType === "event") {
      return (
        <>
          <Text style={styles.modalTitle}>Complete Task</Text>
          <DateTimePicker
            mode="date"
            value={completionDate}
            onChange={(e, date) => handleChangeDate(e, date, setCompletionDate)}
            style={styles.completionDatePicker}
          />
          <Pressable style={styles.modalButton} onPress={handleSaveComplete}>
            <Text style={styles.textStyle}>Save</Text>
          </Pressable>
        </>
      );
    }
    if (formType === "delete") {
      return (
        <>
          <Text style={styles.modalTitle}>Confirm Delete</Text>
          <Pressable style={styles.modalButton} onPress={handleDelete}>
            <Text style={styles.textStyle}>Delete</Text>
          </Pressable>
        </>
      );
    }
    const task = find(tasks, (task) => {
      console.log("task from find", task);
      return task._id.$oid === highlightButton;
    });
    console.log("task from modal", task);
    const daysSinceLastEvent = task?.daysSince > 0 ? task?.daysSince : 0;
    const daysOverdue = task?.moss > 0 ? task?.moss : 0;
    const daysSinceStatus = task?.moss
      ? `${daysSinceLastEvent} Day(s) since`
      : "Never completed!";
    let overdueStatus;
    if (!task?.moss) {
      overdueStatus = "";
    } else if (daysOverdue <= 0) {
      overdueStatus = "";
    } else {
      overdueStatus = `${daysOverdue} Day(s) overdue`;
    }
    return (
      <>
        <View style={styles.taskDetailsWrapper}>
          <Text style={styles.modalTitle}>Task Details</Text>
          <Text
            style={styles.taskDetailsText}
          >{`Every ${task?.frequency} Day(s)`}</Text>
          <Text style={styles.taskDetailsText}>{daysSinceStatus}</Text>
          {overdueStatus && (
            <Text style={styles.taskDetailsText}>{overdueStatus}</Text>
          )}
        </View>
        <Pressable style={styles.modalButton} onPress={handleEdit}>
          <Text style={styles.textStyle}>Edit</Text>
        </Pressable>
        <Pressable style={styles.modalButton} onPress={confirmDelete}>
          <Text style={styles.textStyle}>Delete</Text>
        </Pressable>
        <Pressable style={styles.modalButton} onPress={handleComplete}>
          <Text style={styles.textStyle}>Complete</Text>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <View style={styles.appTitleWrapper}>
        <Text style={styles.appTitle}>mossy</Text>
      </View>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.taskCardContainer}>
            {size(tasks) ? (
              <>
                {map(tasks, (task) => {
                  const taskSelected = highlightButton === task._id.$oid;
                  const daysSinceLastEvent =
                    task.daysSince > 0 ? task.daysSince : 0;
                  const daysOverdue = task.moss > 0 ? task.moss : 0;
                  const isOverdue = task.moss > 0;
                  const neverCompleted = !task.moss;
                  let taskCardStyle;
                  if (taskSelected) {
                    taskCardStyle = styles.taskCardHighlighted;
                  } else if (isOverdue) {
                    taskCardStyle = styles.taskCardOverdue;
                  } else if (neverCompleted) {
                    taskCardStyle = styles.taskCardNeverCompleted;
                  } else {
                    taskCardStyle = styles.taskCard;
                  }
                  let taskTitleStyle;
                  if (taskSelected) {
                    taskTitleStyle = styles.taskTitleHighlighted;
                  } else if (isOverdue) {
                    taskTitleStyle = styles.taskTitleOverdue;
                  } else if (neverCompleted) {
                    taskTitleStyle = styles.taskTitleNeverCompleted;
                  } else {
                    taskTitleStyle = styles.taskTitle;
                  }
                  const titleLength = size(task.name);
                  let titleFontSize;
                  if (titleLength < 15) {
                    titleFontSize = styles.taskTitleFontSizeLarge;
                  } else if (titleLength >= 15 && titleLength < 25) {
                    titleFontSize = styles.taskTitleFontSizeMedium;
                  } else {
                    titleFontSize = styles.taskTitleFontSizeSmall;
                  }
                  const noHighlight =
                    taskSelected || isOverdue || neverCompleted;
                  let badgeStyles;
                  if (noHighlight) {
                    badgeStyles = [
                      styles.taskCardBadge,
                      styles.taskCardBadgeNoBorderColor,
                    ];
                  } else {
                    badgeStyles = styles.taskCardBadge;
                  }
                  return (
                    <Pressable
                      onPress={() => handleTaskCardPress(task._id.$oid)}
                      key={task._id.$oid}
                    >
                      <View style={taskCardStyle}>
                        <Text style={[taskTitleStyle, titleFontSize]}>
                          {task.name}
                        </Text>
                        <View style={styles.badgeWrapper}>
                          <View style={badgeStyles}>
                            <Text style={styles.badgeTitle}>
                              {task.frequency}
                            </Text>
                            <Text style={styles.badgeUom}>Days</Text>
                          </View>
                          <View style={badgeStyles}>
                            <Text style={styles.badgeTitle}>
                              {daysSinceLastEvent}
                            </Text>
                            <Text style={styles.badgeUom}>Days</Text>
                          </View>
                          <View style={badgeStyles}>
                            <Text style={styles.badgeTitle}>{daysOverdue}</Text>
                            <Text style={styles.badgeUom}>Days</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Create some tasks!</Text>
              </View>
            )}
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
      <Modal animationType="slide" transparent visible={isModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {renderForm()}
            <Pressable style={styles.modalButton} onPress={handleCloseModal}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.addTaskButtonWrapper}>
        <Pressable onPress={handleCreate}>
          <Ionicons name="ios-add-circle" size={48} color="#BC96E6" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  taskCardContainer: {
    flex: 0.8,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "90%",
    justifyContent: "center",
  },
  taskTitleFontSizeLarge: {
    fontSize: 30,
  },
  taskTitleFontSizeMedium: {
    fontSize: 25,
  },
  taskTitleFontSizeSmall: {
    fontSize: 20,
  },
  taskCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  taskTitle: {
    fontWeight: 700,
  },
  taskDetailsText: {
    fontSize: 15,
    color: "darkgrey",
    fontWeight: 600,
  },
  taskCardHighlighted: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "#210B2C",
  },
  taskTitleHighlighted: {
    fontWeight: 700,
    color: "white",
  },
  taskTextHighlighted: {
    fontSize: 15,
    color: "white",
    fontWeight: 600,
  },
  taskCardOverdue: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "#55286F",
  },
  taskTitleOverdue: {
    fontWeight: 700,
    color: "white",
  },
  taskTextOverdue: {
    fontSize: 15,
    color: "white",
    fontWeight: 600,
  },
  taskCardNeverCompleted: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "#BC96E6",
  },
  taskTitleNeverCompleted: {
    fontWeight: 700,
    color: "white",
  },
  taskTextNeverCompleted: {
    fontSize: 15,
    color: "white",
    fontWeight: 600,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
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
  completionDatePicker: {
    marginLeft: -10,
    marginBottom: 25,
  },
  badgeWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    height: "30%",
  },
  taskCardBadge: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    minWidth: "30%",
    maxWidth: "30%",
    height: "30%",
    maxHeight: "100%",
    minHeight: "100%",
    borderWidth: 2,
    borderRadius: 5,
    backgroundColor: "white",
  },
  taskCardBadgeNoBorderColor: {
    borderColor: "white",
  },
  badgeTitle: {
    fontSize: 25,
    fontWeight: 600,
  },
  badgeUom: {
    fontSize: 8,
  },
  taskDetailsWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 25,
  },
  appTitle: {},
  appTitleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 5,
    width: '100%',
    borderBottomWidth: 1,
  },
  addTaskButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },  
});
