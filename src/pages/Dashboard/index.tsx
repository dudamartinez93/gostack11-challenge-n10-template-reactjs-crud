import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const foodsLoaded = await api.get('/foods');

      setFoods(foodsLoaded.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFoodPlate: Omit<IFoodPlate, 'id'> = {
        ...food,
        available: true,
      };
      const addedFoodResponse = await api.post('/foods', newFoodPlate);

      setFoods([...foods, addedFoodResponse.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      let editedFood: IFoodPlate = editingFood;

      const foodsUpdated: IFoodPlate[] = foods.map(verifiedFood => {
        if (verifiedFood.id === editingFood.id) {
          editedFood = {
            ...food,
            available: editingFood.available,
            id: editingFood.id,
          };
          return editedFood;
        }
        return verifiedFood;
      });

      if (editedFood === editingFood) {
        throw new Error(
          'Não foi possível encontrar o id do prato a ser editado',
        );
      }

      await api.put(`/foods/${editingFood.id}`, editedFood);

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`/foods/${id}`);
      setFoods(foods.filter(food => food.id !== id));
    } catch (err) {
      console.log(err);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  async function handleEditFoodAvailability(food: IFoodPlate): Promise<void> {
    try {
      const editedFood: IFoodPlate = {
        ...food,
        available: !food.available,
      };

      const foodsUpdated: IFoodPlate[] = foods.map(verifiedFood => {
        if (verifiedFood.id === food.id) {
          return editedFood;
        }
        return verifiedFood;
      });

      if (editedFood === food) {
        throw new Error(
          'Não foi possível encontrar o id do prato a ser editado a disponibilidade',
        );
      }

      await api.put(`/foods/${food.id}`, editedFood);

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleEditFoodAvailability={handleEditFoodAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
