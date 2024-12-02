import React, { useCallback } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  Alert,
} from 'react-native';
import { Tag, type TagRemoveIconProps } from './Tag';
import { TagListMemoized } from './TagList';
import type { ISettings } from '../types/settings';

export const Input: InputComponent = (props) => {
  const inputRef = React.useRef<TextInput>(null);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [tagsList, setInputValues] = React.useState<string[]>([]);

  const handleTextChange = (text: string) => {
    setInputValue(text);

    props.onChangeText?.(text);
  };

  const removeTag = (index: number) => {
    const newItems = tagsList.filter((_, i) => i !== index);
    setInputValues(newItems);
  };

  const handleTagRemoveIconPress = (index: number) => {
    if (props.confirmTagDelete) {
      return removeTagAfterConfirm(index);
    }

    removeTag(index);
  };

  const handleKeyPress = (ev: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const _isPressedKeyBackspace = isPressedKeyBackspace(ev);
    if (_isPressedKeyBackspace) handleBackspacePress();
  };

  const handleSubmitEditing = () => {
    if (inputValue.length > 0) {
      setInputValues([...tagsList, inputValue]);
      setInputValue('');
    } else {
      inputRef.current?.blur();
    }
  };

  const handleBackspacePress = () => {
    const _isCurrentInputEmpty = isCurrentInputEmpty();

    if (_isCurrentInputEmpty) handleRemoveTag();
  };

  const isCurrentInputEmpty = () => inputValue.length === 0;

  const isPressedKeyBackspace = (ev: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const key = ev.nativeEvent.key;

    return key === 'Backspace';
  };

  const handleRemoveTag = () => {
    switch (props.tagBackspaceDeleteBehavior) {
      case 'delete':
        removeLastTag();
        break;
      case 'delete-modify':
        removeLastTagAndSetInputValue();
        break;
      case 'delete-confirm':
        removeTagAfterConfirm(getLastTagIndex());
        break;
    }
  };

  const removeLastTag = () => {
    if (tagsList.length === 0) return;

    const newItems = tagsList.slice(0, -1);
    setInputValues(newItems);
  };

  const removeLastTagAndSetInputValue = () => {
    const lastTag = getLastTag();
    removeLastTag();

    if (lastTag) {
      setInputValue(lastTag);
    }
  };

  const removeTagAfterConfirm = (tagIndex: number) => {
    const handlePress = () => removeTag(tagIndex);

    // TODO: localize the default alert message
    Alert.alert('Are you sure?', 'Do you want to the tag?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: handlePress,
      },
    ]);
  };

  const getLastTagIndex = () => tagsList.length - 1;

  const getLastTag = () => tagsList[getLastTagIndex()];

  const renderTag = useCallback(
    (tag: string, index: number) => {
      const other: TagRemoveIconProps = props.showRemoveButton
        ? {
            isVisible: true,
            onPress: () => handleTagRemoveIconPress(index),
          }
        : {};

      return (
        <Tag key={index} removeIconProps={other}>
          {tag}
        </Tag>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.showRemoveButton, tagsList]
  );

  return (
    <View style={styles.container}>
      <TagListMemoized tags={tagsList} render={renderTag} />

      <TextInput
        value={inputValue}
        submitBehavior={props.blurOnSubmit ? 'blurAndSubmit' : 'submit'}
        ref={inputRef}
        style={styles.input}
        onChangeText={handleTextChange}
        onKeyPress={handleKeyPress}
        onSubmitEditing={handleSubmitEditing}
      />
    </View>
  );
};

export const InputMemoized = React.memo(Input);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
    borderColor: 'black',
    borderWidth: 1,
    padding: 4,
  },
  input: {
    flexGrow: 1,
    // margin: 0,
    marginLeft: 3,
    padding: 0,
  },
  item: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    margin: 2,
    borderWidth: 1,
    borderColor: 'black',
    color: 'red',
  },
});

interface InputProps extends ISettings {
  onChangeText?: (text: string) => void;
}

type InputComponent = React.FC<InputProps>;
