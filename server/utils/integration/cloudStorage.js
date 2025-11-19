export const uploadToOneDrive = async (fileName, fileContent) => {
  try {
    const jsonData = JSON.parse(fileContent);

    return {
      success: true,
      demo: true,
      requestId: jsonData.requestId,
      dataForOneDrive: jsonData,
      fileName: fileName,
    };
  } catch (error) {
    console.error("OneDrive upload error:", error);
    return {
      success: false,
      error: error.message,
      demo: true,
    };
  }
};
