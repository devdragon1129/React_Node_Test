import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch, useSelector } from 'react-redux';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';

const Index = () => {
  const title = "Meeting";
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedValues, setSelectedValues] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [getTagValuesOutSide, setGetTagValuesOutSide] = useState([]);
  const [searchboxOutside, setSearchboxOutside] = useState('');
  const [deleteMany, setDeleteMany] = useState(false);

  const permission = HasAccess(['Meetings'])[0];
  const dispatch = useDispatch();

  const meetingData = useSelector((state) => state.meetingData.data);
  const isLoding = useSelector((state) => state.meetingData.isLoading);

  useEffect(() => {
    dispatch(fetchMeetingData());
  }, [dispatch]);

  const actionHeader = {
    Header: "Action",
    isSortable: false,
    center: true,
    cell: ({ row }) => (
      <Text fontSize="md" fontWeight="900" textAlign="center">
        <Menu isLazy>
          <MenuButton>
            <CiMenuKebab />
          </MenuButton>
          <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>
            {permission?.view && (
              <MenuItem
                py={2.5}
                color={'green'}
                onClick={() => navigate(`/meeting/${row?.values._id}`)}
                icon={<ViewIcon fontSize={15} />}
              >
                View
              </MenuItem>
            )}
            {permission?.delete && (
              <MenuItem
                py={2.5}
                color={'red'}
                onClick={() => {
                  setDeleteMany(true);
                  setSelectedValues([row?.values?._id]);
                }}
                icon={<DeleteIcon fontSize={15} />}
              >
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Text>
    )
  };

  const tableColumns = [
    {
      Header: "#",
      accessor: "_id",
      isSortable: false,
      width: 10
    },
    {
      Header: 'Agenda',
      accessor: 'agenda',
      cell: (cell) => (
        <Link to={`/meeting/${cell?.row?.values._id}`}>
          <Text
            me="10px"
            sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
            color='brand.600'
            fontSize="sm"
            fontWeight="700"
          >
            {cell?.value || ' - '}
          </Text>
        </Link>
      )
    },
    { Header: "Date & Time", accessor: "dateTime" },
    { Header: "Time Stamp", accessor: "timestamp" },
    { Header: "Create By", accessor: "createdByName" },
    ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
  ];

  const handleDeleteMeeting = async (ids) => {
    try {
      const payload = { ids };
      const response = await deleteManyApi('api/meeting/deleteMany', payload);
      if (response.status === 200) {
        setSelectedValues([]);
        setDeleteMany(false);
        dispatch(fetchMeetingData());
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <CommonCheckTable
        title={title}
        isLoding={isLoding}
        columnData={tableColumns ?? []}
        allData={meetingData ?? []}
        tableData={meetingData}
        searchDisplay={false}
        setSearchDisplay={() => {}}
        searchedDataOut={[]}
        setSearchedDataOut={() => {}}
        tableCustomFields={[]}
        access={permission}
        onOpen={onOpen}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        setDelete={setDeleteMany}
        AdvanceSearch={
          <Button
            variant="outline"
            colorScheme='brand'
            leftIcon={<SearchIcon />}
            mt={{ sm: "5px", md: "0" }}
            size="sm"
            onClick={() => setAdvanceSearch(true)}
          >
            Advance Search
          </Button>
        }
        getTagValuesOutSide={getTagValuesOutSide}
        searchboxOutside={searchboxOutside}
        setGetTagValuesOutside={setGetTagValuesOutSide}
        setSearchboxOutside={setSearchboxOutside}
        handleSearchType="MeetingSearch"
      />

      <MeetingAdvanceSearch
        advanceSearch={advanceSearch}
        setAdvanceSearch={setAdvanceSearch}
        setSearchedData={() => {}}
        setDisplaySearchData={() => {}}
        allData={meetingData ?? []}
        setAction={() => dispatch(fetchMeetingData())}
        setGetTagValues={setGetTagValuesOutSide}
        setSearchbox={setSearchboxOutside}
      />

      <AddMeeting
        setAction={() => dispatch(fetchMeetingData())}
        isOpen={isOpen}
        onClose={onClose}
      />

      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type='Meetings'
        handleDeleteData={handleDeleteMeeting}
        ids={selectedValues}
      />
    </div>
  );
};

export default Index;
