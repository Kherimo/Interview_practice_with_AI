import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps, ViewStyle, TextStyle } from 'react-native';

interface TextInputCustomProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  borderColor?: string;
  focusBorderColor?: string;
}

const TextInputCustom: React.FC<TextInputCustomProps> = ({
  label,
  containerStyle,
  inputStyle,
  borderColor = '#ccc',
  focusBorderColor = '#00E0FF',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.wrapper,
          { borderColor: focused ? focusBorderColor : borderColor }
        ]}
      >
        <TextInput
          {...props}
          style={[styles.input, inputStyle]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor="#C2C2C2"
        />
      </View>
    </View>
  );
};

export default TextInputCustom;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
  },
  wrapper: {
    borderWidth: 2, // border rõ hơn để dễ thấy khi đổi màu
    borderRadius: 12,
    backgroundColor: 'rgba(217,217,217,0.15)',
    paddingHorizontal: 12,
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#fff',
  },
});
