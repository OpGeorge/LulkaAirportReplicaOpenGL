#include "Camera.hpp"

namespace gps {

	//Camera constructor
	Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
		//TODO
		this->cameraPosition = cameraPosition;
		this->cameraTarget = cameraTarget;
		
		this->cameraFrontDirection = glm::normalize(  cameraTarget - cameraPosition);
		this->cameraRightDirection = glm::normalize(glm::cross(cameraUp, this->cameraFrontDirection));
		this->cameraUpDirection = glm::cross(this->cameraFrontDirection,this->cameraRightDirection);
	}

	float yaw = -90.0f;

	//return the view matrix, using the glm::lookAt() function
	glm::mat4 Camera::getViewMatrix() {
		
		
		return glm::lookAt(this->cameraPosition, this->cameraPosition + this->cameraFrontDirection, this->cameraUpDirection);
	}

	//update the camera internal parameters following a camera move event
	void Camera::move(MOVE_DIRECTION direction, float speed) {
		//TODO
		if (direction == gps::MOVE_FORWARD) {
			cameraPosition += cameraFrontDirection * speed;
		}

		if (direction == gps::MOVE_BACKWARD) {
			cameraPosition -= cameraFrontDirection * speed;
		}
		if (direction == gps::MOVE_LEFT) {
			cameraPosition -= glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;
		}

		if (direction == gps::MOVE_RIGHT) {
			cameraPosition += glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection)) * speed;
		}
	}

	//update the camera internal parameters following a camera rotate event
	//yaw - camera rotation around the y axis
	//pitch - camera rotation around the x axis
	void Camera::rotate(float pitch, float yaw) {
		glm::vec3 front;
		front.x = cos(glm::radians(pitch)) * cos(glm::radians(yaw));
		front.y = sin(glm::radians(pitch));
		front.z = cos(glm::radians(pitch)) * sin(glm::radians(yaw));
		this->cameraFrontDirection = glm::normalize(front);
	}

}