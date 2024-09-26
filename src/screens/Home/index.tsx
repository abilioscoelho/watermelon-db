import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Q } from "@nozbe/watermelondb";

import { Menu, MenuTypeProps } from "../../components/Menu";
import { Skill } from "../../components/Skill";
import { Button } from "../../components/Button";

import { Container, Title, Input, Form, FormTitle } from "./styles";
import { database } from "../../database";
import { SkillModel } from "../../database/models/SkillModel";

export function Home() {
  const [type, setType] = useState<MenuTypeProps>("soft");
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<SkillModel[]>([]);
  const [skill, setSkill] = useState<SkillModel>({} as SkillModel);

  const bottomSheetRef = useRef<BottomSheet>(null);

  async function handleSave() {
    if (skill.id) {
      await database.write(async () => {
        await skill.update((data) => {
          data.name = name;
          data.type = type;
        });
      });
      setSkill({} as SkillModel);
      setName("");
      Alert.alert("Sucesso", "Registro Editado com sucesso!");
    } else {
      await database.write(async () => {
        await database.get<SkillModel>("skills").create((data) => {
          (data.name = name), (data.type = type);
        });
      });
      setName("");
      Alert.alert("Sucesso", "Registro Salvo com sucesso!");
    }
    bottomSheetRef.current?.collapse();
    fetchData();
  }
  async function handleRemove(item: SkillModel) {
    await database.write(async () => {
      await item.destroyPermanently();
    });
    fetchData();
  }

  async function fetchData() {
    const skillCollection = await database.get<SkillModel>("skills");
    const response = await skillCollection.query(Q.where("type", type)).fetch();
    setSkills(response);
  }

  async function handleEdit(item: SkillModel) {
    setSkill(item);
    setName(item.name);
    bottomSheetRef.current?.expand();
  }

  useEffect(() => {
    fetchData();
  }, [type]);
  return (
    <Container>
      <Title>About me</Title>
      <Menu type={type} setType={setType} />

      <FlatList
        data={skills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Skill
            data={item}
            onEdit={() => handleEdit(item)}
            onRemove={() => handleRemove(item)}
          />
        )}
      />

      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={["5%", "35%"]}>
        <Form>
          <FormTitle>{skill.id ? "Editar" : "Adicionar"}</FormTitle>

          <Input
            placeholder="New skill..."
            onChangeText={setName}
            value={name}
          />

          <Button title="Save" onPress={handleSave} />
        </Form>
      </BottomSheet>
    </Container>
  );
}
