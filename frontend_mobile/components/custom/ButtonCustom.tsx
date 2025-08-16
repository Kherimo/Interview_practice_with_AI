import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle, 
  ButtonProps 
} from 'react-native';

interface CustomButtonProps extends ButtonProps {
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const ButtonCustom: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, rest.disabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest} // giữ lại props của Button
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ButtonCustom;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00E0FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
