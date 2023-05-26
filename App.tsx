import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import { GestureHandlerRootView, TouchableOpacity, Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';

const App = () => {
  const [totalBill, setTotalBill] = useState('');
  const [items, setItems] = useState([]);
  const [location, setLocation] = useState('');
  const [salesTax, setSalesTax] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [totalAfterTax, setTotalAfterTax] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [splitMessage, setSplitMessage] = useState('');

  useEffect(() => {
    const calculateSubtotal = () => {
      const total = items.reduce((sum, item) => sum + item.cost, 0);
      setSubtotal(total);
    };

    calculateSubtotal();
  }, [items]);

  const handleAddItem = () => {
    if (totalBill) {
      const newItem = {
        id: String(items.length + 1),
        cost: parseFloat(totalBill),
      };
      setItems([...items, newItem]);
      setTotalBill('');
    }
  };
  const handleDeleteItem = (itemId) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    setItems(updatedItems);
  };

  const handleFindSalesTax = async () => {
    try {
      const response = await axios.get('http://localhost:3000/sales-tax', {
        params: {
          city: location,
        },
      });
  
      const { salesTax } = response.data;
      setSalesTax(salesTax.toString());
    } catch (error) {
      console.error('Error retrieving sales tax:', error);
      Alert.alert('Error', 'Failed to retrieve sales tax.');
    }
  };
  

  const handleCalculateSplit = () => {
    if (location && salesTax && tipAmount) {
      const split = parseFloat(tipAmount) + totalAfterTax;
      setSplitMessage(`Your split is: $${split.toFixed(2)}`);
      setShowModal(true);
    }
  };

  const handleTipPercentagePress = (percentage) => {
    const tip = parseFloat(percentage) * totalAfterTax;
    setTipAmount(tip.toFixed(2));
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleNewSplit = () => {
    setShowModal(false);
    setTipAmount('');
    setItems([]);
    setLocation('');
    setSalesTax('');
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButtonContainer}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.listItemContainer}>
        <Text style={styles.listItem}>Item Cost: ${item.cost.toFixed(2)}</Text>
      </View>
    </Swipeable>
  );


  useEffect(() => {
    const calculateTotalAfterTax = () => {
      if (salesTax) {
        const tax = subtotal * (parseFloat(salesTax) / 100);
        const total = subtotal + tax;
        setTotalAfterTax(total);
      }
    };

    calculateTotalAfterTax();
  }, [salesTax, subtotal]);

  return (
    <GestureHandlerRootView style={styles.container}>
    <View style={styles.container}>
      <Text  style={styles.heading}>MySplit</Text>

      <View style={styles.inputContainer}>
        <Text style={{color:'white', fontWeight:'bold'}}>Cost of Item:</Text>
        <TextInput
          style={styles.input}
          value={totalBill}
          onChangeText={setTotalBill}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={handleAddItem} style={{marginTop:8,justifyContent:'center', alignItems:'center',borderWidth:1, height:30, borderRadius:10,backgroundColor:'turquoise', borderColor:'turquoise'}}>
          <Text style={{color:'white',fontWeight:'bold', fontFamily:'Righteous-Regular', fontSize:18}}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>Items:</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Text style={styles.subtotalText}>Subtotal: ${subtotal.toFixed(2)}</Text>
     
      <View style={styles.inputContainer}>
        <Text style={{color:'white', fontWeight:'bold'}}>Sales Tax:</Text>
        <TextInput
          style={styles.input}
          value={salesTax}
          onChangeText={setSalesTax}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={{color:'white',fontWeight:'bold'}}>City:</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity onPress={handleFindSalesTax} style={{marginTop:8,justifyContent:'center', alignItems:'center',borderWidth:1, height:30, borderRadius:10,backgroundColor:'turquoise', borderColor:'turquoise'}}>
          <Text style={{color:'white',fontWeight:'bold', fontFamily:'Righteous-Regular', fontSize:18}}>Find CA Sales Tax</Text>
        </TouchableOpacity>
        {salesTax ? (
          <Text style={{fontWeight:'bold', color:'white'}}>Total After Tax: ${totalAfterTax.toFixed(2)}</Text>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={{color:'white', fontWeight:'bold'}}>Tip:</Text>
        <TextInput
          style={styles.input}
          value={tipAmount}
          onChangeText={setTipAmount}
          keyboardType="numeric"
          placeholder="Tip Amount"
        />
        <View style={styles.tipButtonsContainer}>
          <TouchableOpacity style={styles.tipButton} onPress={() => handleTipPercentagePress('0.1')}>
            <Text style={styles.tipButtonText}>10%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tipButton} onPress={() => handleTipPercentagePress('0.15')}>
            <Text style={styles.tipButtonText}>15%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tipButton} onPress={() => handleTipPercentagePress('0.2')}>
            <Text style={styles.tipButtonText}>20%</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleCalculateSplit} style={{marginTop:8,justifyContent:'center', alignItems:'center',borderWidth:1, height:30, borderRadius:10,backgroundColor:'turquoise', borderColor:'turquoise'}}>
          <Text style={{color:'white',fontWeight:'bold', fontSize: 18, fontFamily:'Righteous-Regular'}}>Find My Split!</Text>
        </TouchableOpacity>    


      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalMessage}>{splitMessage}</Text>
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity onPress={handleModalClose} style={{backgroundColor:'white', borderColor:'white', borderWidth:1, width:100, alignContent:'center', justifyContent:'center',alignItems:'center', borderRadius:10}}>
            <Text style={{fontFamily:'Righteous-Regular', color:'turquoise', fontSize:20}}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNewSplit} style={{backgroundColor:'white',borderColor:'white', borderWidth:1, width:100, alignContent:'center', justifyContent:'center',alignItems:'center', borderRadius:10}}>
            <Text style={{fontFamily:'Righteous-Regular', color:'turquoise', fontSize:20}}>New Split</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#343a40',
  },
  heading: {
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
    color:'turquoise',
    fontFamily:'Righteous-Regular'
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 4,
    color:'white'
  },
  inputContainer: {
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  list: {
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  subtotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    color:'white'
  },
  tipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tipButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'turquoise',
    borderColor:'turquoise'
  },
  tipButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  button: {
    borderWidth: 1,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'turquoise'
  },
  modalMessage: {
    fontSize: 34,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily:'Righteous-Regular',
    color:'white',
    fontWeight:'bold'
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  listItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  deleteButtonContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#FF0000',
    width: 80,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
  },
});

export default App;
