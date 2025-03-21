import { 
    Box, Button, Flex, Grid, GridItem, Heading, Text 
  } from "@chakra-ui/react";
  import Card from "components/card/Card";
  import { HSeparator } from "components/separator/Separator";
  import Spinner from "components/spinner/Spinner";
  import moment from "moment";
  import { useEffect, useState } from "react";
  import { IoIosArrowBack } from "react-icons/io";
  import { Link, useNavigate, useParams } from "react-router-dom";
  import { HasAccess } from "../../../redux/accessUtils";
  import { getApi, deleteApi } from "services/api";
  import { DeleteIcon } from "@chakra-ui/icons";
  import CommonDeleteModel from "components/commonDeleteModel";
  import { FaFilePdf } from "react-icons/fa";
  import html2pdf from "html2pdf.js";
  
  const View = () => {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
  
    const fetchMeeting = async () => {
      setIsLoading(true);
      try {
        const response = await getApi('api/meeting/view/', id);
        if (response?.data?.success) {
          setMeeting(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching meeting:", error);
      }
      setIsLoading(false);
    };
  
    useEffect(() => {
      fetchMeeting();
    }, [id]);
  
    const generatePDF = () => {
      setPdfLoading(true);
      const element = document.getElementById("reports");
      const hideBtn = document.getElementById("hide-btn");
      if (element) {
        if (hideBtn) hideBtn.style.display = 'none';
        html2pdf()
          .from(element)
          .set({
            margin: [0, 0, 0, 0],
            filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          })
          .save()
          .then(() => {
            setPdfLoading(false);
            if (hideBtn) hideBtn.style.display = '';
          });
      } else {
        console.error("Element with ID 'reports' not found.");
        setPdfLoading(false);
      }
    };
  
    const handleDelete = async () => {
      setIsLoading(true);
      try {
        const response = await deleteApi('api/meeting/delete/', id);
        if (response.status === 200) {
          setDeleteConfirm(false);
          navigate(-1);        }
      } catch (error) {
        console.error("Error deleting meeting:", error);
      }
      setIsLoading(false);
    };
  
    const [permission] = HasAccess(['Meetings']);
  
    return (
      <>
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" width="100%">
            <Spinner />
          </Flex>
        ) : (
          <>
            <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
              <GridItem colSpan={4}>
                <Heading size="lg" m={3}>
                  {meeting?.agenda || ""}
                </Heading>
              </GridItem>
              <GridItem colSpan={4}>
                <Card>
                  <Grid gap={4}>
                    <GridItem colSpan={2}>
                      <Flex justifyContent="space-between">
                        <Heading size="md" mb={3}>
                          Meeting Details
                        </Heading>
                        <Box id="hide-btn">
                          <Button
                            leftIcon={<FaFilePdf />}
                            size="sm"
                            variant="brand"
                            onClick={generatePDF}
                            disabled={pdfLoading}
                          >
                            {pdfLoading ? "Please Wait..." : "Print as PDF"}
                          </Button>
                          <Button
                            leftIcon={<IoIosArrowBack />}
                            size="sm"
                            variant="brand"
                            onClick={() => navigate(-1)}
                            ml={2}
                          >
                            Back
                          </Button>
                        </Box>
                      </Flex>
                      <HSeparator />
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Agenda
                      </Text>
                      <Text>{meeting?.agenda || '-'}</Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Created By
                      </Text>
                      <Text>{meeting?.createdByName || '-'}</Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Date Time
                      </Text>
                      <Text>
                        {meeting?.dateTime
                          ? moment(meeting?.dateTime).format('DD-MM-YYYY h:mma')
                          : '-'}
                      </Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Timestamp
                      </Text>
                      <Text>
                        {meeting?.timestamp
                          ? moment(meeting?.timestamp).format('DD-MM-YYYY h:mma')
                          : '-'}
                      </Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Location
                      </Text>
                      <Text>{meeting?.location || '-'}</Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Notes
                      </Text>
                      <Text>{meeting?.notes || '-'}</Text>
                    </GridItem>
                    <GridItem colSpan={[2, 1]}>
                      <Text fontSize="sm" fontWeight="bold">
                        Attendees
                      </Text>
                      {meeting?.related === 'Contact' && meeting?.attendes?.length > 0 ? (
                        meeting.attendes.map((attendee) => (
                          <Link key={attendee._id} to={`/contactView/${attendee._id}`}>
                            <Text color="brand.600">
                              {attendee.firstName + ' ' + attendee.lastName}
                            </Text>
                          </Link>
                        ))
                      ) : meeting?.related === 'Lead' && meeting?.attendesLead?.length > 0 ? (
                        meeting.attendesLead.map((attendee) => (
                          <Link key={attendee._id} to={`/leadView/${attendee._id}`}>
                            <Text color="brand.600">{attendee.leadName}</Text>
                          </Link>
                        ))
                      ) : (
                        <Text>-</Text>
                      )}
                    </GridItem>
                  </Grid>
                </Card>
              </GridItem>
            </Grid>
  
            {(user.role === 'superAdmin' || (permission?.update || permission?.delete)) && (
              <Card mt={3}>
                <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                  <GridItem colStart={6}>
                    <Flex justifyContent="right">
                      {(user.role === 'superAdmin' || permission?.delete) && (
                        <Button
                          size="sm"
                          background="red.800"
                          onClick={() => setDeleteConfirm(true)}
                          leftIcon={<DeleteIcon />}
                          colorScheme="red"
                        >
                          Delete
                        </Button>
                      )}
                    </Flex>
                  </GridItem>
                </Grid>
              </Card>
            )}
          </>
        )}
  
        <CommonDeleteModel
          isOpen={deleteConfirm}
          onClose={() => setDeleteConfirm(false)}
          type="Meetings"
          handleDeleteData={handleDelete}
          ids={id}
        />
      </>
    );
  };
  
  export default View;
  